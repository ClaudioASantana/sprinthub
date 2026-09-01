import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';

@Injectable()
export class SyncStoriesService {
  private readonly logger = new Logger(SyncStoriesService.name);

  constructor(private prisma: PrismaService) {}

  async syncFromMarkdown() {
    this.logger.log('Iniciando sincronização de markdowns...');

    // Calcula o caminho para docs/stories a partir de dist/sync-stories/
    const docsDir = path.resolve(__dirname, '../../../../docs/stories');

    if (!fs.existsSync(docsDir)) {
      this.logger.warn(`Diretório não encontrado: ${docsDir}`);
      return { error: `Diretório docs/stories não encontrado em ${docsDir}` };
    }

    const files = fs.readdirSync(docsDir).filter((f) => f.endsWith('.md'));
    let synced = 0;

    for (const file of files) {
      const filePath = path.join(docsDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');

      // Parse do frontmatter
      const { data, content } = matter(fileContent);

      // Extrai os metadados. Se não houver, tenta pegar do texto
      const title =
        data.title ||
        this.extractTitleFromContent(content) ||
        file.replace('.md', '');
      const projectId = data.projectId;

      if (!projectId) {
        this.logger.warn(
          `Arquivo ${file} ignorado pois não possui projectId no frontmatter.`,
        );
        continue;
      }

      // Preparar os dados da Task
      const taskData = {
        title: title,
        description: content.trim(),
        type: data.type || 'story',
        status: data.status || 'todo',
        priority: data.priority || 'medium',
        storyPoints: data.storyPoints ? parseInt(data.storyPoints) : null,
        projectId: projectId,
        githubProjectItemId: file, // Armazena o filename para mapeamento
      };

      // Tenta encontrar a task pelo título e projeto para atualizar em vez de duplicar
      const existingTask = await this.prisma.task.findFirst({
        where: { title, projectId },
      });

      if (existingTask) {
        await this.prisma.task.update({
          where: { id: existingTask.id },
          data: taskData,
        });
        this.logger.log(`Atualizada task: ${title}`);
      } else {
        await this.prisma.task.create({
          data: taskData,
        });
        this.logger.log(`Criada nova task: ${title}`);
      }
      synced++;
    }

    return { totalProcessados: synced, totalArquivos: files.length };
  }

  private extractTitleFromContent(content: string): string | null {
    const match = content.match(/^#\s+(.+)$/m);
    return match ? match[1] : null;
  }
}

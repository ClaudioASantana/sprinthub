const { validateSync, IsString, IsOptional } = require('class-validator');

class TestDto {
  @IsString()
  @IsOptional()
  sprintId;
}

const dto = new TestDto();
dto.sprintId = null;

const errors = validateSync(dto);
console.log(errors);

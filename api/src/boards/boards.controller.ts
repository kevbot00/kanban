import { Controller, Get, Param } from '@nestjs/common';

@Controller('boards')
export class BoardsController {
  @Get('/:id')
  getBoardById(@Param('id') id: string): { id: string } {
    return { id };
  }
}

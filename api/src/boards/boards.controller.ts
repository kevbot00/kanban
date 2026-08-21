import { Controller, Get, Param } from '@nestjs/common';
import { BoardsService } from './boards.service';

@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Get('/:id')
  async getBoardById(@Param('id') id: string): Promise<any> {
    return await this.boardsService.findById(id);
  }
}

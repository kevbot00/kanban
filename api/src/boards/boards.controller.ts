import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { BoardsService } from './boards.service';

@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Get(':id')
  getBoardById(@Param('id', ParseUUIDPipe) id: string) {
    return this.boardsService.findById(id);
  }
}

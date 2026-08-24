import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { MoveCardDto } from './dto/move-card.dto';

@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get(':id')
  getCardById(@Param('id', ParseUUIDPipe) id: string) {
    return this.cardsService.findById(id);
  }

  @Post()
  createCard(@Body() dto: CreateCardDto) {
    return this.cardsService.create(dto);
  }

  @Patch(':id')
  updateCard(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCardDto,
  ) {
    return this.cardsService.update(id, dto);
  }

  @Post(':id/move')
  @HttpCode(200)
  moveCard(@Param('id', ParseUUIDPipe) id: string, @Body() dto: MoveCardDto) {
    return this.cardsService.move(id, dto);
  }
}

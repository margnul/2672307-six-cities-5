import { IsInt, IsString, Length, Max, Min } from 'class-validator';

export class CreateCommentDto {
  @IsString({ message: 'Text is required' })
  @Length(5, 1024, { message: 'Min length is 5, max is 1024' })
  public text!: string;

  @IsInt({ message: 'Rating must be an integer' })
  @Min(1, { message: 'Min rating is 1' })
  @Max(5, { message: 'Max rating is 5' })
  public rating!: number;

  public offerId!: string;
  public userId!: string;
}

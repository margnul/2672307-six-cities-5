import {
  IsArray, IsBoolean, IsEnum, IsInt, IsString, Max, MaxLength,
  Min, MinLength, IsObject, IsUrl, ArrayMinSize, ArrayMaxSize
} from 'class-validator';

import { City } from '../../../../types/city.enum.js'; // Убедись, что эти енамы созданы
import { HousingType } from '../../../../types/housing-type.enum.js';
import { Amenity } from '../../../../types/amenity.enum.js';

export class CreateOfferDto {
  @MinLength(10, { message: 'Minimum title length must be 10' })
  @MaxLength(100, { message: 'Maximum title length must be 100' })
  public title!: string;

  @MinLength(20, { message: 'Minimum description length must be 20' })
  @MaxLength(1024, { message: 'Maximum description length must be 1024' })
  public description!: string;

  @IsEnum(City, { message: 'City must be one of: Paris, Cologne, Brussels, Amsterdam, Hamburg, Dusseldorf' })
  public city!: City;

  @IsUrl({}, { message: 'previewUrl must be a valid URL' })
  public previewUrl!: string;

  @IsArray({ message: 'Images must be an array' })
  @ArrayMinSize(6, { message: 'Should be exactly 6 images' })
  @ArrayMaxSize(6, { message: 'Should be exactly 6 images' })
  public images!: string[];

  @IsBoolean({ message: 'isPremium must be a boolean' })
  public isPremium!: boolean;

  @IsEnum(HousingType, { message: 'Type must be apartment, house, room or hotel' })
  public type!: HousingType;

  @IsInt({ message: 'Rooms must be an integer' })
  @Min(1, { message: 'Minimum rooms is 1' })
  @Max(8, { message: 'Maximum rooms is 8' })
  public rooms!: number;

  @IsInt({ message: 'Guests must be an integer' })
  @Min(1, { message: 'Minimum guests is 1' })
  @Max(10, { message: 'Maximum guests is 10' })
  public guests!: number;

  @IsInt({ message: 'Price must be an integer' })
  @Min(100, { message: 'Minimum price is 100' })
  @Max(100000, { message: 'Maximum price is 100000' })
  public price!: number;

  @IsArray({ message: 'Amenities must be an array' })
  @IsEnum(Amenity, { each: true, message: 'Invalid amenity type' })
  public amenities!: Amenity[];

  @IsObject({ message: 'Coordinates must be an object' })
  public location!: {
    latitude: number;
    longitude: number;
  };

  public userId!: string;

  @IsString({ message: 'postDate must be a valid ISO date' })
  public postDate!: Date;
}

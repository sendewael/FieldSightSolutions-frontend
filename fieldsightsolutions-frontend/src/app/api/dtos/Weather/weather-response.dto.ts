import { WeatherDataDTO } from './weather-data.dto';

// representeert de response van de weer API (array met meerdere weatherDataDTO's)
export interface WeatherResponseDTO {
    response: WeatherDataDTO[];
  }
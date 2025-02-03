// representeert 1 weatherdata object
export interface WeatherDataDTO {
    date: string;
    temperature_2m_max: number;
    temperature_2m_min: number;
    precipitation_sum: number;
  }
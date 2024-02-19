import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap} from 'rxjs/operators';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { HistoricalTemperatureData } from './HistoricalTemperatureData.interface';

const apiKey = 'a0dba5b32a0ffa05f423410c50f2f6b0';
const units = 'f';

@Injectable({
  providedIn: 'root'
})
export class ApiServiceService {
  private weatherData: any;
  private weatherHistory: any[] = [];
  private historicalWeather: any[] = [];
  private historicalTemperature: any;

  constructor(
    private http: HttpClient, 
    private db: AngularFireDatabase) { }

  getWeather(location: string) {
    return this.http.get(
      'http://api.weatherstack.com/current?access_key=' + apiKey + '&units=' + units + '&query=' + location
    );
  }

  getHistoricalWeather(location: string, historicalDate: string) {
    return this.http.get(
      'http://api.weatherstack.com/historical?access_key=' + apiKey + '&units=' + units + '&query=' + location + '&historical_date=' + historicalDate
    );
  }

  storeHistoricalWeather(data: HistoricalTemperatureData) {
    return this.db.list('historicalWeather').push(data);
  }
  
  getStoredWeatherData(): Observable<any[]> {
    return this.db.list<any>('weatherHistory').valueChanges();
  }

  getStoredHistoricalWeather(): Observable<any[]> {
    return this.db.list<any>('historicalWeather').valueChanges()
  }
}

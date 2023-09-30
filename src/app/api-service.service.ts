import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs';
import { AngularFireDatabase } from '@angular/fire/compat/database';

const apiKey = 'a0dba5b32a0ffa05f423410c50f2f6b0';
const units = 'f';

@Injectable({
  providedIn: 'root'
})
export class ApiServiceService {
  private weatherData: any;
  private weatherHistory: any[] = [];

  constructor(
    private http: HttpClient, 
    private db: AngularFireDatabase) { }

  getWeather(location: string) {
    return this.http.get(
      'http://api.weatherstack.com/current?access_key=' + apiKey + '&units=' + units + '&query=' + location
    ).pipe(
      tap((data) => {
        this.weatherData = data;
        this.weatherHistory.push(data);
      })
    );
  }

  getStoredWeatherData(): any[] {
    return this.weatherHistory;
  }
}

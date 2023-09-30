import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ApiServiceService } from '../api-service.service';
import { AngularFireDatabase } from '@angular/fire/compat/database';

@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.css'],
})
export class WeatherComponent implements OnInit {
  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiServiceService,
    private db: AngularFireDatabase
  ) {}
  weatherSearch!: FormGroup;
  weatherData: any;
  weatherHistory: any[] = [];

  ngOnInit() {
    this.weatherSearch = this.formBuilder.group({
      location: [''],
    });

    this.db.list('weatherHistory').valueChanges().subscribe((data: any) => {
      this.weatherHistory = data
    });
  }
  sendToAPI(formValues: any) {
    this.apiService.getWeather(formValues.location).subscribe((data) => {
      this.weatherData = data;
      this.weatherHistory.push(data);
      this.db.list('weatherHistory').push(data);
      console.log(data);
    });
  }

  getStoredWeatherData() {
    return this.weatherHistory;
  }

  clearStoredWeatherData() {
    if (confirm('Are you sure you want to clear all stored weather data?')) {
      this.db.database.ref().remove()
      .then(() => {
        console.log('Firebase data cleared successfully');
      })
      .catch((error) => {
        console.error('Error clearing firebase data.', error);
      });
    }
  }
}

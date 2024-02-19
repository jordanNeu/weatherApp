import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { ApiServiceService } from '../api-service.service';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { HistoricalTemperatureData } from '../HistoricalTemperatureData.interface';

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

  historicalWeatherSearch!: FormGroup;
  historicalTemperatureData!: HistoricalTemperatureData;
  historicalWeather: any[] = [];

  ngOnInit() {
    this.weatherSearch = this.formBuilder.group({
      location: [''],
      date: [''],
    });

    this.historicalWeatherSearch = this.formBuilder.group({
      historicalLocation: [''],
      historicalYearsAgo: new FormControl('3'),
      historicalDate: new FormControl(''),
    });

    this.db
      .list('weatherHistory')
      .valueChanges()
      .subscribe((data: any) => {
        this.weatherHistory = data;
      });

      this.db
      .list('historicalWeather')
      .valueChanges()
      .subscribe((data: any) => {
        this.historicalWeather = data;
      });
  }

  sendToAPI(formValues: any) {
    this.apiService.getWeather(formValues.location).subscribe((data) => {
      this.weatherData = data;
      this.weatherHistory.push(data);
      this.db.list('weatherHistory').push(data);
    });
  }
  
  getStoredWeatherData() {
    return this.weatherHistory;
  }

  getHistoricalWeatherData() {
    return this.historicalWeather;
  }

  clearStoredWeatherData() {
    if (confirm('Are you sure you want to clear all stored weather data?')) {
      this.weatherHistory.forEach((weatherData: any) => {
        const key = weatherData.key;
        this.db
          .list('weatherHistory')
          .remove(key)
          .then(() => {
            console.log(`Weather data with key ${key} removed successfully`);
          })
          .catch((error) => {
            console.error(`Error removing weather data with key ${key}`, error);
          });
      });
      this.weatherHistory = [];
    }
  }
  getHistoricalTemperature(formValues: any) {
    const location = formValues.historicalLocation;
    const selectedDate = new Date(formValues.historicalDate);
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 15;
  
    const historicalDates: string[] = [];
  
    for (let year = currentYear; year >= startYear; year -= 3) {
      const targetMonth = selectedDate.getMonth() + 1;
      const targetDay = selectedDate.getDate();
      const historicalDate = `${year}-${
        targetMonth < 10 ? '0' + targetMonth : targetMonth
      }-${targetDay < 10 ? '0' + targetDay : targetDay}`;
  
      historicalDates.push(historicalDate);
    }
  
    this.historicalWeather = []; // Clear the previous historical weather data
  
    const fetchHistoricalWeather = (index: number) => {
      if (index >= historicalDates.length) {
        return;
      }
  
      const date = historicalDates[index];
  
      this.apiService.getHistoricalWeather(location, date).subscribe(
        (data: any) => {
          this.historicalTemperatureData = data;
          console.log('Historical Data:', data);
          this.historicalWeather.push(data);
          this.apiService.storeHistoricalWeather(data);
  
          fetchHistoricalWeather(index + 1); // Fetch the next historical weather data
        },
        (error) => {
          console.error('Error Fetching Historical Weather Data', error);
          fetchHistoricalWeather(index + 1); // Fetch the next historical weather data even if there's an error
        }
      );
    };
  
    fetchHistoricalWeather(0);
  }

  getMaxTempertures() {
    const maxTemperatures: number[] = [];

    this.historicalWeather.forEach((weatherData: any) => {
      const maxTemp = weatherData.main.maxtemp;
      maxTemperatures.push(maxTemp);
    });

    return maxTemperatures;
  }
}

  // WORKS BEST!
//   getHistoricalTemperature(formValues: any) {
//     const location = formValues.historicalLocation;
//     const yearsAgo = formValues.historicalYearsAgo;
//     const currentYear = new Date().getFullYear();
//     const selectedDate = new Date(formValues.historicalDate);
//     // const targetYear = currentYear - yearsAgo;
//     const targetYear = currentYear - yearsAgo * 3;
//     //const targetMonth = selectedDate.getMonth() + 1;
//     //const targetDay = selectedDate.getDate();
//     const historicalDates: string[] = [];

//     for (let i = 0; i <= yearsAgo; i ++) {
//       const year = targetYear + i * 3;
//       const targetMonth = selectedDate.getMonth() + 1;
//       const targetDay = selectedDate.getDate();
//       const historicalDate = `${year}-${
//         targetMonth < 10 ? '0' + targetMonth : targetMonth
//       }-${targetDay < 10 ? '0' + targetDay : targetDay}`;

//       historicalDates.push(historicalDate)
//     }
//     this.historicalWeather = [];

//     historicalDates.forEach((date) => {
//       this.apiService.getHistoricalWeather(location, date).subscribe((data: any) => {
//         this.historicalTemperatureData = data;
//         console.log('Historical Data: ', data);
//         this.historicalWeather.push(data);
//         this.apiService.storeHistoricalWeather(data);
//       },
//       (error) => {
//         console.error('Error Fetching Historical Weather Data', error);
//       }
//       );
//     });
//   }
// }
    
// Temporarily Commented
  //   this.apiService.getHistoricalWeather(location, historicalDate).subscribe(
  //     (data: any) => {
  //       this.historicalTemperatureData = data;
  //       console.log(`Historical Data: `, data);
  //       this.apiService.storeHistoricalWeather(data)
  //       console.log(this.historicalWeather);
  //     },
  //     (error) => {
  //       console.error('Error fetching historical weather data', error);
  //     }
  //   );
  // }
// WORKS BEST! needs improvement

// sendToAPI(formValues: any) {
//   const selectedDate = formValues.date;
//   const location = formValues.location;
//   const currentYear = new Date().getFullYear();

//   const yearsAgo = [3, 6, 9, 12, 15];
//   const apiCalls = yearsAgo.map((years) => {
//     const targetYear = currentYear - years;
//     const targetDate = this.getTargetDate(targetYear, selectedDate);
//     return this.apiService.getHistoricalWeather(location, targetDate);
//   });
//   Promise.all(apiCalls).then((responses) => {
//     this.weatherData = responses.map((response, index) => {
//       const years = yearsAgo[index];
//       const targetYear = currentYear - years;

//       return response.pipe(
//         map((data: any) => {
//           console.log(data);
//           const historicalData = data.historical[selectedDate];
//           const temperature = historicalData ? historicalData.maxtemp : 'N/A';

//           return{
//             year: targetYear,
//             temperature: temperature,
//           };
//         })
//       ).subscribe();
//     });
//   });
// }

/**
 * Location cache service for storing and managing location data
 */
import type { Country } from '../../countries/types/countries.types';
import type { Department } from '../../departments/types/departments.types';
import type { Municipality } from '../../municipalities/types/municipalities.types';
import type { District } from '../../districts/types/districts.types';

export class LocationCache {
  private static countriesCache: Country[] = [];
  private static departmentsCache: Department[] = [];
  private static municipalitiesCache: Municipality[] = [];
  private static districtsCache: District[] = [];

  static getCountriesCache(): Country[] {
    return this.countriesCache;
  }

  static setCountriesCache(countries: Country[]): void {
    this.countriesCache = countries;
  }

  static getDepartmentsCache(): Department[] {
    return this.departmentsCache;
  }

  static setDepartmentsCache(departments: Department[]): void {
    this.departmentsCache = departments;
  }

  static getMunicipalitiesCache(): Municipality[] {
    return this.municipalitiesCache;
  }

  static addToMunicipalitiesCache(municipalities: Municipality[]): void {
    this.municipalitiesCache = [...this.municipalitiesCache, ...municipalities];
  }

  static getDistrictsCache(): District[] {
    return this.districtsCache;
  }

  static addToDistrictsCache(districts: District[]): void {
    this.districtsCache = [...this.districtsCache, ...districts];
  }

  static findCountryById(countryId: string): Country | undefined {
    return this.countriesCache.find(c => c.id === countryId || c.isoCode === countryId);
  }

  static findDepartmentById(departmentId: string): Department | undefined {
    return this.departmentsCache.find(d => d.id === departmentId);
  }

  static findMunicipalityById(municipalityId: string): Municipality | undefined {
    return this.municipalitiesCache.find(m => m.id === municipalityId);
  }

  static findDistrictById(districtId: string): District | undefined {
    return this.districtsCache.find(d => d.id === districtId);
  }
}
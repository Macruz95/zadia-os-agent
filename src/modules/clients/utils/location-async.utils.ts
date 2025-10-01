/**
 * Asynchronous location name resolvers using real data services
 */
import { logger } from '@/lib/logger';
import { CountriesService } from '../../countries/services/countries.service';
import { DepartmentsService } from '../../departments/services/departments.service';
import { MunicipalitiesService } from '../../municipalities/services/municipalities.service';
import { DistrictsService } from '../../districts/services/districts.service';
import { LocationCache } from './location-cache.service';

/**
 * Get country name by ID from real data
 */
export const getCountryNameById = async (countryId: string): Promise<string> => {
  try {
    if (LocationCache.getCountriesCache().length === 0) {
      const countries = await CountriesService.getCountries();
      LocationCache.setCountriesCache(countries);
    }
    
    const country = LocationCache.findCountryById(countryId);
    return country ? country.name : countryId;
  } catch (error) {
    logger.error('Error getting country name', error as Error, {
      component: 'location-async-utils',
      action: 'getCountryNameById',
      metadata: { countryId }
    });
    return countryId;
  }
};

/**
 * Get department name by ID from real data
 */
export const getDepartmentNameById = async (departmentId: string): Promise<string> => {
  try {
    if (LocationCache.getDepartmentsCache().length === 0) {
      const departments = await DepartmentsService.getDepartments();
      LocationCache.setDepartmentsCache(departments);
    }
    
    const department = LocationCache.findDepartmentById(departmentId);
    return department ? department.name : departmentId;
  } catch (error) {
    logger.error('Error getting department name', error as Error, {
      component: 'location-async-utils',
      action: 'getDepartmentNameById',
      metadata: { departmentId }
    });
    return departmentId;
  }
};

/**
 * Get municipality name by ID from real data
 */
export const getMunicipalityNameById = async (municipalityId: string, departmentId?: string): Promise<string> => {
  try {
    // Try to get from cache first
    let municipality = LocationCache.findMunicipalityById(municipalityId);
    
    if (!municipality && departmentId) {
      // If not in cache and we have departmentId, fetch by department
      const municipalities = await MunicipalitiesService.getMunicipalitiesByDepartment(departmentId);
      LocationCache.addToMunicipalitiesCache(municipalities);
      municipality = municipalities.find(m => m.id === municipalityId);
    }
    
    return municipality ? municipality.name : municipalityId;
  } catch (error) {
    logger.error('Error getting municipality name', error as Error, {
      component: 'location-async-utils',
      action: 'getMunicipalityNameById',
      metadata: { municipalityId }
    });
    return municipalityId;
  }
};

/**
 * Get district name by ID from real data
 */
export const getDistrictNameById = async (districtId: string, municipalityId?: string): Promise<string> => {
  try {
    // Try to get from cache first
    let district = LocationCache.findDistrictById(districtId);
    
    if (!district && municipalityId) {
      // If not in cache and we have municipalityId, fetch by municipality
      const districts = await DistrictsService.getDistrictsByMunicipality(municipalityId);
      LocationCache.addToDistrictsCache(districts);
      district = districts.find(d => d.id === districtId);
    }
    
    return district ? district.name : districtId;
  } catch (error) {
    logger.error('Error getting district name', error as Error, {
      component: 'location-async-utils',
      action: 'getDistrictNameById',
      metadata: { districtId }
    });
    return districtId;
  }
};
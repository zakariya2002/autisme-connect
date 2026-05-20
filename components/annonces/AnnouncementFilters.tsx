'use client';

import { useEffect, useRef, useState } from 'react';
import { professions } from '@/lib/professions-config';
import {
  ACCOMPANIMENT_TYPE_LABELS,
  TND_CONTEXT_LABELS,
  PLACE_TYPE_LABELS,
  AccompanimentType,
  TndContext,
  PlaceType,
  GenderPreference,
} from './types';

export type AnnouncementFiltersState = {
  location: string;
  radius: string;
  accompanimentTypes: AccompanimentType[];
  desiredProfessions: string[];
  tndContext: TndContext[];
  placeTypes: PlaceType[];
  genderPreference: GenderPreference | '';
  hoursMin: string;
  hoursMax: string;
  startDateFrom: string;
};

export const initialFilters: AnnouncementFiltersState = {
  location: '',
  radius: '',
  accompanimentTypes: [],
  desiredProfessions: [],
  tndContext: [],
  placeTypes: [],
  genderPreference: '',
  hoursMin: '',
  hoursMax: '',
  startDateFrom: '',
};

const ACCOMPANIMENT_VALUES = Object.keys(ACCOMPANIMENT_TYPE_LABELS) as AccompanimentType[];
const TND_VALUES = Object.keys(TND_CONTEXT_LABELS) as TndContext[];
const PLACE_VALUES = Object.keys(PLACE_TYPE_LABELS) as PlaceType[];

const PARIS_ARRONDISSEMENTS = [
  'Paris 1er', 'Paris 2e', 'Paris 3e', 'Paris 4e', 'Paris 5e',
  'Paris 6e', 'Paris 7e', 'Paris 8e', 'Paris 9e', 'Paris 10e',
  'Paris 11e', 'Paris 12e', 'Paris 13e', 'Paris 14e', 'Paris 15e',
  'Paris 16e', 'Paris 17e', 'Paris 18e', 'Paris 19e', 'Paris 20e',
];

type Props = {
  filters: AnnouncementFiltersState;
  onChange: (next: AnnouncementFiltersState) => void;
  onReset: () => void;
  activeCount: number;
};

export default function AnnouncementFilters({ filters, onChange, onReset, activeCount }: Props) {
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const update = (patch: Partial<AnnouncementFiltersState>) => {
    onChange({ ...filters, ...patch });
  };

  const toggleIn = <T extends string>(list: T[], value: T): T[] =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const fetchLocationSuggestions = (query: string) => {
    if (query.length < 2) {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const queryLower = query.toLowerCase();
      if (queryLower.startsWith('paris')) {
        const filtered = PARIS_ARRONDISSEMENTS.filter((arr) => arr.toLowerCase().includes(queryLower));
        if (filtered.length > 0) {
          setLocationSuggestions(['Paris', ...filtered]);
          setShowLocationSuggestions(true);
          return;
        }
      }
      try {
        const response = await fetch(
          `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=10&type=municipality`,
        );
        const data = await response.json();
        if (data.features && data.features.length > 0) {
          const suggestions = data.features.map((f: any) => f.properties.label);
          setLocationSuggestions(suggestions.slice(0, 8));
          setShowLocationSuggestions(true);
        } else {
          setLocationSuggestions([]);
          setShowLocationSuggestions(false);
        }
      } catch {
        setLocationSuggestions([]);
      }
    }, 250);
  };

  return (
    <div className="bg-white rounded-xl md:rounded-2xl shadow-xl p-3 sm:p-4 md:p-5 lg:sticky lg:top-24 border border-gray-100 overflow-hidden relative">
      <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: '#027e7e' }}></div>

      <div className="flex items-center justify-between gap-2.5 mb-4 sm:mb-5 pt-2">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
            style={{ backgroundColor: '#027e7e' }}
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M6 8h12M9 12h6m-3 4h0" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900" style={{ fontFamily: 'Verdana, sans-serif' }}>
              Filtrer
            </h2>
            <p className="text-xs text-gray-500" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              {activeCount > 0 ? `${activeCount} filtre(s) actif(s)` : 'Affinez votre recherche'}
            </p>
          </div>
        </div>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-semibold text-gray-500 hover:text-teal-600 underline"
          >
            Réinitialiser
          </button>
        )}
      </div>

      <div className="space-y-4" style={{ fontFamily: 'Open Sans, sans-serif' }}>
        {/* Localisation */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <svg className="w-4 h-4" style={{ color: '#027e7e' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Localisation
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Tapez une ville..."
              value={filters.location}
              onChange={(e) => {
                update({ location: e.target.value });
                fetchLocationSuggestions(e.target.value);
              }}
              onFocus={() => filters.location.length >= 2 && setShowLocationSuggestions(true)}
              onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
              className="w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:ring-2 focus:border-transparent transition-all"
            />
            {showLocationSuggestions && locationSuggestions.length > 0 && (
              <ul
                className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto"
                role="listbox"
              >
                {locationSuggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    onClick={() => {
                      update({ location: suggestion });
                      setLocationSuggestions([]);
                      setShowLocationSuggestions(false);
                    }}
                    className="px-4 py-2.5 hover:bg-teal-50 cursor-pointer text-sm text-gray-700 border-b border-gray-100 last:border-b-0"
                    role="option"
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {filters.location && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-gray-600">Rayon de recherche</label>
                <span className="text-sm font-bold" style={{ color: '#027e7e' }}>
                  {filters.radius ? `${filters.radius} km` : 'Ville exacte'}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={filters.radius || '0'}
                onChange={(e) => update({ radius: e.target.value === '0' ? '' : e.target.value })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{ accentColor: '#027e7e' }}
                aria-label={`Rayon de recherche: ${filters.radius || '0'} km`}
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0</span>
                <span>25</span>
                <span>50</span>
                <span>75</span>
                <span>100 km</span>
              </div>
            </div>
          )}
        </div>

        {/* Type d'accompagnement */}
        <div className="space-y-2 pt-3 border-t border-gray-200">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <svg className="w-4 h-4" style={{ color: '#027e7e' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Type d'accompagnement
          </label>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-2">
            {ACCOMPANIMENT_VALUES.map((value) => (
              <label key={value} className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.accompanimentTypes.includes(value)}
                  onChange={() => update({ accompanimentTypes: toggleIn(filters.accompanimentTypes, value) })}
                  className="h-4 w-4 border-gray-300 rounded cursor-pointer"
                  style={{ accentColor: '#027e7e' }}
                />
                <span className="ml-2 text-sm text-gray-700 group-hover:text-teal-600 transition-colors">
                  {ACCOMPANIMENT_TYPE_LABELS[value]}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Profession recherchée */}
        <div className="space-y-2 pt-3 border-t border-gray-200">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <svg className="w-4 h-4" style={{ color: '#027e7e' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Profession recherchée
          </label>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-2">
            {professions.map((p) => (
              <label key={p.value} className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.desiredProfessions.includes(p.value)}
                  onChange={() => update({ desiredProfessions: toggleIn(filters.desiredProfessions, p.value) })}
                  className="h-4 w-4 border-gray-300 rounded cursor-pointer"
                  style={{ accentColor: '#027e7e' }}
                />
                <span className="ml-2 text-sm text-gray-700 group-hover:text-teal-600 transition-colors">
                  {p.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Contexte TND */}
        <div className="space-y-2 pt-3 border-t border-gray-200">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <svg className="w-4 h-4" style={{ color: '#027e7e' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Contexte TND
          </label>
          <div className="flex flex-wrap gap-1.5">
            {TND_VALUES.map((value) => {
              const active = filters.tndContext.includes(value);
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => update({ tndContext: toggleIn(filters.tndContext, value) })}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-all ${
                    active ? 'text-white' : 'text-gray-700 bg-white border-gray-300 hover:border-teal-400'
                  }`}
                  style={active ? { backgroundColor: '#027e7e', borderColor: '#027e7e' } : {}}
                  aria-pressed={active}
                >
                  {TND_CONTEXT_LABELS[value]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Lieu d'intervention */}
        <div className="space-y-2 pt-3 border-t border-gray-200">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <svg className="w-4 h-4" style={{ color: '#027e7e' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Lieu d'intervention
          </label>
          <div className="space-y-1.5">
            {PLACE_VALUES.map((value) => (
              <label key={value} className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.placeTypes.includes(value)}
                  onChange={() => update({ placeTypes: toggleIn(filters.placeTypes, value) })}
                  className="h-4 w-4 border-gray-300 rounded cursor-pointer"
                  style={{ accentColor: '#027e7e' }}
                />
                <span className="ml-2 text-sm text-gray-700 group-hover:text-teal-600 transition-colors">
                  {PLACE_TYPE_LABELS[value]}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Genre du professionnel */}
        <div className="space-y-2 pt-3 border-t border-gray-200">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <svg className="w-4 h-4" style={{ color: '#027e7e' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Genre du professionnel
          </label>
          <div className="flex flex-col gap-1.5">
            {([
              ['', 'Indifférent'],
              ['male', 'Masculin'],
              ['female', 'Féminin'],
            ] as const).map(([value, label]) => (
              <label key={value || 'any'} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="gender_preference"
                  checked={filters.genderPreference === value}
                  onChange={() => update({ genderPreference: value as GenderPreference | '' })}
                  className="h-4 w-4 cursor-pointer"
                  style={{ accentColor: '#027e7e' }}
                />
                <span className="ml-2 text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Heures par semaine */}
        <div className="space-y-2 pt-3 border-t border-gray-200">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <svg className="w-4 h-4" style={{ color: '#027e7e' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Heures par semaine
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-xs text-gray-500 block mb-1">Min</span>
              <input
                type="number"
                min="0"
                max="40"
                value={filters.hoursMin}
                onChange={(e) => update({ hoursMin: e.target.value })}
                placeholder="0"
                className="w-full border border-gray-300 rounded-lg py-2 px-2 text-sm"
              />
            </div>
            <div>
              <span className="text-xs text-gray-500 block mb-1">Max</span>
              <input
                type="number"
                min="0"
                max="40"
                value={filters.hoursMax}
                onChange={(e) => update({ hoursMax: e.target.value })}
                placeholder="40"
                className="w-full border border-gray-300 rounded-lg py-2 px-2 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Date début */}
        <div className="space-y-2 pt-3 border-t border-gray-200">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <svg className="w-4 h-4" style={{ color: '#027e7e' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Disponibilité à partir de
          </label>
          <input
            type="date"
            value={filters.startDateFrom}
            onChange={(e) => update({ startDateFrom: e.target.value })}
            className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm"
          />
        </div>
      </div>
    </div>
  );
}

export function countActiveFilters(filters: AnnouncementFiltersState): number {
  let count = 0;
  if (filters.location) count++;
  if (filters.radius) count++;
  count += filters.accompanimentTypes.length;
  count += filters.desiredProfessions.length;
  count += filters.tndContext.length;
  count += filters.placeTypes.length;
  if (filters.genderPreference) count++;
  if (filters.hoursMin) count++;
  if (filters.hoursMax) count++;
  if (filters.startDateFrom) count++;
  return count;
}

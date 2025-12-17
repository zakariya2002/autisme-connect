'use client';

import { useState } from 'react';

interface CalendarProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  availableDays?: number[]; // Les jours de la semaine disponibles (0-6), tous par défaut
  minDate?: Date;
  fullyBookedDates?: string[]; // Les dates complètement réservées (format YYYY-MM-DD)
}

export default function Calendar({ selectedDate, onDateSelect, availableDays = [0, 1, 2, 3, 4, 5, 6], minDate = new Date(), fullyBookedDates = [] }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  // Obtenir le premier jour du mois
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  // Obtenir le dernier jour du mois
  const getLastDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  };

  // Générer les jours du calendrier
  const generateCalendarDays = () => {
    const firstDay = getFirstDayOfMonth(currentMonth);
    const lastDay = getLastDayOfMonth(currentMonth);
    const startingDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: (Date | null)[] = [];

    // Ajouter des jours vides pour aligner le premier jour
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Ajouter tous les jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
    }

    return days;
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const isDateSelectable = (date: Date) => {
    // Vérifier si la date est dans le passé
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return false;

    // Vérifier si le jour de la semaine est disponible
    const dayOfWeek = date.getDay();
    return availableDays.includes(dayOfWeek);
  };

  const isDateSelected = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return dateStr === selectedDate;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isDateFullyBooked = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return fullyBookedDates.includes(dateStr);
  };

  const handleDateClick = (date: Date) => {
    if (isDateSelectable(date) && !isDateFullyBooked(date)) {
      const dateStr = date.toISOString().split('T')[0];
      onDateSelect(dateStr);
    }
  };

  const calendarDays = generateCalendarDays();
  const isPreviousMonthDisabled = () => {
    const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const today = new Date();
    today.setDate(1);
    today.setHours(0, 0, 0, 0);
    return prevMonth < today;
  };

  return (
    <div className="bg-gradient-to-br from-white to-primary-50/30 border-2 border-primary-200 rounded-xl shadow-lg overflow-hidden" role="application" aria-label="Calendrier de sélection de date">
      {/* En-tête du calendrier */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={goToPreviousMonth}
            disabled={isPreviousMonthDisabled()}
            className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed text-white"
            aria-label="Mois précédent"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="text-base sm:text-xl font-bold text-white" aria-live="polite">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <button
            type="button"
            onClick={goToNextMonth}
            className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-all text-white"
            aria-label="Mois suivant"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="p-3 sm:p-6">
        {/* Jours de la semaine */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 sm:mb-3" role="row">
          {dayNames.map((day) => (
            <div key={day} className="text-center text-[10px] sm:text-xs font-bold text-primary-700 py-1 sm:py-2" role="columnheader">
              {day}
            </div>
          ))}
        </div>

        {/* Grille du calendrier */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2" role="grid" aria-label="Jours du mois">
          {calendarDays.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const selectable = isDateSelectable(date);
            const selected = isDateSelected(date);
            const today = isToday(date);
            const fullyBooked = isDateFullyBooked(date);

            return (
              <button
                key={index}
                type="button"
                onClick={() => handleDateClick(date)}
                disabled={!selectable || fullyBooked}
                role="gridcell"
                aria-selected={selected}
                aria-label={`${date.getDate()} ${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}${today ? ', aujourd\'hui' : ''}${fullyBooked ? ', complet' : ''}${!selectable ? ', non disponible' : ''}`}
                tabIndex={selectable && !fullyBooked ? 0 : -1}
                className={`
                  aspect-square p-1 sm:p-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 relative
                  ${selected
                    ? 'bg-primary-600 text-white shadow-lg scale-105 ring-2 sm:ring-4 ring-primary-200'
                    : fullyBooked && selectable
                    ? 'bg-orange-100 text-orange-700 border-2 border-orange-300 cursor-not-allowed'
                    : today && selectable
                    ? 'bg-primary-100 text-primary-800 border-2 border-primary-400 hover:bg-primary-200'
                    : selectable
                    ? 'bg-white text-gray-900 border-2 border-gray-200 hover:border-primary-400 hover:bg-primary-50 sm:hover:scale-105 hover:shadow-md'
                    : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                  }
                `}
              >
                <span className="relative z-10">{date.getDate()}</span>
                {fullyBooked && selectable && (
                  <span className="absolute top-0.5 right-0.5 text-[8px] sm:text-[10px] text-orange-600 font-bold" aria-hidden="true">✕</span>
                )}
                {today && !selected && selectable && !fullyBooked && (
                  <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-600 rounded-full" aria-hidden="true"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* Légende */}
        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t-2 border-primary-100" role="region" aria-label="Légende du calendrier">
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-2 sm:gap-4 text-[10px] sm:text-xs">
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-md bg-primary-600 shadow-sm" aria-hidden="true"></div>
              <span className="font-medium text-gray-700">Sélectionné</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-md bg-primary-100 border-2 border-primary-400" aria-hidden="true"></div>
              <span className="font-medium text-gray-700">Aujourd'hui</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-md bg-white border-2 border-gray-200" aria-hidden="true"></div>
              <span className="font-medium text-gray-700">Disponible</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-md bg-orange-100 border-2 border-orange-300" aria-hidden="true"></div>
              <span className="font-medium text-gray-700">Complet</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-md bg-gray-50" aria-hidden="true"></div>
              <span className="font-medium text-gray-700">Non dispo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

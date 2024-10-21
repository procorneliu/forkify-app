import View from './View';

// Importing calendar
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin, { Draggable } from '@fullcalendar/interaction';
import full from 'core-js/full';
import { addDurations } from '@fullcalendar/core/internal';

class ScheduleView extends View {
  _parentElement = document.querySelector('.schedule-calendar-window');
  _errorMessage = 'There something is went wrong...!';
  _message = '';

  _containerEl = document.querySelector('.schedule__list');
  _overlay = document.querySelector('.overlay-schedule');
  _btnOpen = document.querySelector('.nav__btn--schedule-calendar');
  _btnClose = document.querySelector('.btn--close-schedule');
  _calendarEl = document.getElementById('calendar');

  constructor() {
    super();

    this._addHandlerShowWindow();
    this._addHandlerCloseWindow();

    let draggable = new Draggable(this._containerEl, {
      itemSelector: '.draggable__el',
      eventData: function (eventEl) {
        return {
          title: eventEl.innerText,
        };
      },
    });

    let calendar = new Calendar(this._calendarEl, {
      plugins: [dayGridPlugin, listPlugin, interactionPlugin],
      timeZone: 'UTC',
      initialView: 'dayGridWeek',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridWeek,listWeek',
      },
      businessHours: true,
      allDayContent: false,
      droppable: true,
      editable: true,
      fixedMirrorParent: document.body,
    });
    calendar.render();
  }

  _toggleWindow() {
    this._overlay.classList.toggle('hidden');
    this._parentElement.classList.toggle('hidden');
  }

  _closeWindow() {
    this._overlay.classList.add('hidden');
    this._parentElement.classList.add('hidden');
  }

  _addHandlerShowWindow() {
    this._btnOpen.addEventListener('click', this._toggleWindow.bind(this));
  }

  _addHandlerCloseWindow() {
    this._btnClose.addEventListener('click', this._closeWindow.bind(this));
    this._overlay.addEventListener('click', this._closeWindow.bind(this));
  }
}

export default new ScheduleView();

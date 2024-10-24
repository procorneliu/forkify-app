import View from './View';
import previewView from './previewView.js';

// Importing calendar
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin, { Draggable } from '@fullcalendar/interaction';
import full from 'core-js/full';
import { EventContainer } from '@fullcalendar/core/internal';

class ScheduleView extends View {
  _parentElement = document.querySelector('.schedule__list');
  _errorMessage = 'No planned meals...';
  _message = '';

  _containerEl = document.querySelector('.schedule-calendar-window');
  _overlay = document.querySelector('.overlay-schedule');
  _btnOpen = document.querySelector('.nav__btn--schedule-calendar');
  _btnClose = document.querySelector('.btn--close-schedule');
  _calendarEl = document.getElementById('calendar');

  _btnClearList = document.querySelector('.schedules__btn__clear');

  constructor() {
    super();

    this._addHandlerShowWindow();
    this._addHandlerCloseWindow();
  }

  renderCalendar(onDropHandler, onEventChangeHandler, onRemoveEventsHandler, storedEvents) {
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
      customButtons: {
        deleteAllEvents: {
          text: 'Delete All Events',
          click: function () {
            const events = calendar.getEvents();
            events.forEach(event => event.remove());

            onRemoveEventsHandler('events');
          },
        },
      },
      initialView: 'dayGridWeek',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridWeek,listWeek',
      },
      footerToolbar: {
        right: 'deleteAllEvents',
      },

      businessHours: true,
      firstDay: 1,
      allDayContent: false,
      droppable: true,
      editable: true,
      eventDurationEditable: false,
      fixedMirrorParent: document.body,
      events: storedEvents,
      drop: function (info) {
        onDropHandler(info);
      },
      eventChange: function (info) {
        onEventChangeHandler(info);
      },
      eventClick: function (info) {
        console.log(info.event);
        window.open(`${window.location.origin}${info.event.extendedProps.url}`, '_self');
      },
    });
    calendar.render();
  }

  addHandlerRender(handler) {
    window.addEventListener('load', handler);
  }

  addHandlerClearList(handler) {
    this._btnClearList.addEventListener('click', handler);
  }

  _generateMarkup() {
    return this._data.map(schedule => previewView.render(schedule, false)).join('');
  }

  _toggleWindow() {
    this._overlay.classList.toggle('hidden');
    this._containerEl.classList.toggle('hidden');
  }

  _closeWindow() {
    this._overlay.classList.add('hidden');
    this._containerEl.classList.add('hidden');
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

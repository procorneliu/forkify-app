import View from './View';
import previewView from './previewView.js';
import full from 'core-js/full';

// Importing calendar
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin, { Draggable } from '@fullcalendar/interaction';

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

  // Generatig HTML for previewing recipes on MEALS LIST
  _generateMarkup() {
    return this._data.map(schedule => previewView.render(schedule, false)).join('');
  }

  // Handler when page is loaded
  addHandlerRender(handler) {
    window.addEventListener('load', handler);
  }

  // Handler for 'Clear List' button
  addHandlerClearList(handler) {
    this._btnClearList.addEventListener('click', handler);
  }

  // Show window
  _toggleWindow() {
    this._overlay.classList.toggle('hidden');
    this._containerEl.classList.toggle('hidden');
  }

  // Hide window
  _closeWindow() {
    this._overlay.classList.add('hidden');
    this._containerEl.classList.add('hidden');
  }

  // When 'Schedule' button is clicked
  _addHandlerShowWindow() {
    this._btnOpen.addEventListener('click', this._toggleWindow.bind(this));
  }

  // When 'x' button or space around window is clicked
  _addHandlerCloseWindow() {
    this._btnClose.addEventListener('click', this._closeWindow.bind(this));
    this._overlay.addEventListener('click', this._closeWindow.bind(this));
  }

  /**
   * // RENDERING CALENDAR
   * @param onDropHandler - function(), when an event is dropped on calendar.
   * @param onEventChangeHandler - function(), when event position is changed on calendar.
   * @param onRemoveEventsHandler - function(), when clicking button "Delete All Event" to remove all events and from local storage too.
   * @param storedEvents - path/, getting events that are stored in 'state' to display them on calendar
   */
  renderCalendar(onDropHandler, onEventChangeHandler, onRemoveEventsHandler, storedEvents) {
    // Make recipe lists from container to be draggable
    let draggable = new Draggable(this._containerEl, {
      itemSelector: '.draggable__el',
      eventData: function (eventEl) {
        return {
          title: eventEl.innerText,
        };
      },
    });

    // Creating new calendar with specified options
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
      // When new event is dropped on calendar, firest this
      drop: function (info) {
        onDropHandler(info);
      },
      // When existing event position is changed, fires this
      eventChange: function (info) {
        onEventChangeHandler(info);
      },
      // When calendar receive a new event, almost exactly as DROP handler above
      eventReceive: function (info) {
        // Setting url for each dropped calendar
        info.event.setExtendedProp('url', `${info.draggedEl.children[0].attributes[1].value}`);
      },
      // When event from calendar is clicked
      eventClick: function (info) {
        // Open page of event
        window.open(`${window.location.origin}${info.event.extendedProps.url}`, '_self');
      },
    });
    // Render calendar itself
    calendar.render();
  }
}

export default new ScheduleView();

/**
 * @fileoverview Factory module for WeekView (customized for service)
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 */
'use strict';

var util = global.ne.util;
var domutil = require('../../common/domutil');

// Parent views
var Week = require('../../view/week/week');

// Sub views
var DayName = require('../../view/week/dayname');
var Milestone = require('../view/milestone');
var TaskView = require('../view/taskview');
var TimeGrid = require('../../view/week/timeGrid');
var Allday = require('../../view/week/allday');


// Handlers
var AlldayCreation = require('../../handler/allday/creation');
var AlldayMove = require('../../handler/allday/move');
var AlldayResize = require('../../handler/allday/resize');
var TimeCreation = require('../../handler/time/creation');
var TimeMove = require('../../handler/time/move');
var TimeResize = require('../../handler/time/resize');

// Base Templates
var weekViewTmpl = require('../../dooray/view/template/factory/weekView.hbs');

module.exports = function(baseController, layoutContainer, dragHandler, options) {
    var weekView,
        dayNameView,
        milestoneView,
        taskView,
        alldayView,
        timeGridView,
        alldayOptions,
        alldayCreationHandler,
        alldayMoveHandler,
        alldayResizeHandler,
        timeCreationHandler,
        timeMoveHandler,
        timeResizeHandler;

    weekView = new Week(null, options.week, layoutContainer);

    weekView.container.innerHTML = weekViewTmpl();

    // Dayname
    dayNameView = new DayName(null, domutil.find('.schedule-view-dayname-layout', weekView.container));
    weekView.addChild(dayNameView);

    /**********
     * AllDay View
     **********/
    alldayOptions = util.extend({
        title: null,
        height: 20
    }, options.week);

    function getViewModelFunc(key) {
        return function(viewModel) {
            return viewModel.eventsInDateRange[key];
        };
    }
    
    // 마일스톤 뷰
    milestoneView = new Milestone(options.week, domutil.find('.schedule-view-milestone-layout'));
    weekView.addChild(milestoneView);

    // 업무 뷰
    taskView = new TaskView(options.week, domutil.find('.schedule-view-milestone-layout'));
    weekView.addChild(taskView);

    // Allday - wholeDay
    alldayOptions.title = '종일일정';
    alldayOptions._getViewModelFunc = getViewModelFunc('allday');
    alldayView = new Allday(options.week, domutil.find('.schedule-view-allday-layout', weekView.container));
    alldayCreationHandler = new AlldayCreation(dragHandler, alldayView, baseController);
    alldayMoveHandler = new AlldayMove(dragHandler, alldayView, baseController);
    alldayResizeHandler = new AlldayResize(dragHandler, alldayView, baseController);
    weekView.addChild(alldayView);

    /**********
     * TimeGrid View
     **********/
    timeGridView = new TimeGrid(options.week, domutil.find('.schedule-view-timegrid-layout', weekView.container));
    timeCreationHandler = new TimeCreation(dragHandler, timeGridView, baseController);
    timeMoveHandler = new TimeMove(dragHandler, timeGridView, baseController);
    timeResizeHandler = new TimeResize(dragHandler, timeGridView, baseController);

    weekView.handlers = {
        allday: {
            creation: alldayCreationHandler,
            move: alldayMoveHandler,
            resize: alldayResizeHandler
        },
        time: {
            creation: timeCreationHandler,
            move: timeMoveHandler,
            resize: timeResizeHandler
        }
    };

    weekView.addChild(timeGridView);

    // add controller
    weekView.controller = baseController.Week;

    // add destroy
    weekView._beforeDestroy = function() {
        timeCreationHandler.off();
        timeMoveHandler.off();
        timeResizeHandler.off();
        timeCreationHandler.destroy();
        timeMoveHandler.destroy();
        timeResizeHandler.destroy();

        alldayCreationHandler.off();
        alldayMoveHandler.off();
        alldayResizeHandler.off();
        alldayCreationHandler.destroy();
        alldayMoveHandler.destroy();
        alldayResizeHandler.destroy();

        delete weekView.handlers.time;
        delete weekView.handlers.allday;

        timeCreationHandler = timeMoveHandler = timeResizeHandler = null;
    };

    return weekView;
};

/**
 * @license
 * Copyright 2016 Chris Smith (space.dandy@icloud.com)
 * MIT-licensed (http://opensource.org/licenses/MIT)
 */

/**
 * @fileoverview This provides the default Dygraph axis scaling mechanism.
 * @author Chris Smith (space.dandy@icloud.com)
 */

import * as utils from './dygraph-utils';

/*global Dygraph:false */
"use strict";

/**
 * Dygraph default axis scaling functions.
 * @class
 */
var DygraphDefaultScale = {};

/**
 * Convert a scaled value back to the original data value.
 *
 * @param {Dygraph} graph
 * @param {number} axis the axis to which the data value has been scaled.
 * @param {number} rsv relative scale value.  A value between 0 and 1 which represents the value's position on the axis scale.
 */
DygraphDefaultScale.scaledValueToDataPoint = function(graph, axis, sv) {
  if (!graph.attributes_.getForAxis("logscale", axis))
    return sv;

  return Math.pow(10, sv);
};

/**
 * Convert a data value to its scaled equivalent.
 *
 * @param {Dygraph} graph
 * @param {number} axis the axis to which the data value has been scaled.
 * @param {number} the data value to be scaled.
 */
DygraphDefaultScale.dataPointToScaledValue = function(graph, axis, v) {
  if (!graph.attributes_.getForAxis("logscale", axis))
    return v;

  return utils.log10(v);
};

/**
 * Convert a scaled value back to a data value in the given range.
 *
 * @param {Dygraph} graph
 * @param {number} axis the axis to which the data value has been scaled.
 * @param {number} rsv relative scale value.  A value between 0 and 1 which represents the value's position on the axis scale.
 * @param {number} range_start the starting data value of the axis range.
 * @param {number} range_end the ending data value of the axis range.
 * @param invert true if the scale is inverted, so that rsv 0 represents range_end, not range_start.
 */
DygraphDefaultScale.relativeScaledValueToDataPoint = function(graph, axis, rsv, range_start, range_end, invert) {
  var range_width = range_end - range_start;
  var range_value = invert ? range_end : range_start;

  if (!graph.attributes_.getForAxis("logscale", axis)) {
    if (invert)
      range_value = range_end - (rsv * range_width);
	else
      range_value = range_start + (rsv * range_width);
  } else {
    if (invert)
      range_value = utils.logRangeFraction(range_end, range_start, rsv);
	else
      range_value = utils.logRangeFraction(range_start, range_end, rsv);
  }

  return range_value;
};

/**
 * Convert a data value in the given range to a scaled value.
 *
 * @param {Dygraph} graph
 * @param {number} axis the axis to which the data value has been scaled.
 * @param {number} the data value to be scaled.
 * @param {number} range_start the starting data value of the axis range.
 * @param {number} range_end the ending data value of the axis range.
 * @param invert true if the scale is inverted, so that scaled value 0 represents range_end, not range_start.
 * @return {number} the scaled value, which lies between 0 and 1 and which represents the value's position within the range.
 */
DygraphDefaultScale.dataPointToRelativeScaledValue = function(graph, axis, value, range_start, range_end, invert) {
  var scaled_value = invert ? 1.0 : 0.0;

  if (!graph.attributes_.getForAxis("logscale", axis)) {
  	var range_width = range_end - range_start;
	if (range_width === 0)
		range_width = 1.0;

	scaled_value = (value - range_start) / range_width;
  } else {
    var log_range_start = utils.log10(range_start);
    var log_range_end = utils.log10(range_end);
  	var log_range_width = log_range_end - log_range_start;
	if (log_range_width === 0)
		log_range_width = 1.0;

	scaled_value = (utils.log10(value) - log_range_start) / log_range_width;
	if (!isFinite(scaled_value))
		scaled_value = NaN; // shim for v8 issue; see pull request 276
  }

  if (invert)
      scaled_value = 1.0 - scaled_value;

  return scaled_value;
};

/**
 * Return true if the range cannot be represented by this scaler.
 *
 * @param {Dygraph} graph
 * @param {number} axis the axis to which the data value has been scaled.
 * @param {number} range_start the starting data value of the axis range.
 * @param {number} range_end the ending data value of the axis range.
 */
DygraphDefaultScale.rangeError = function(graph, axis, range_start, range_end) {
  if (!graph.attributes_.getForAxis("logscale", axis)) {
    return false;
  } else {
    var log_range_start = utils.log10(range_start);
    var log_range_end = utils.log10(range_end);
  	var log_range_width = log_range_end - log_range_start;
    if (log_range_width === 0)
      log_range_width = 1.0;

    var log_scale = 1.0 / log_range_width;

    if (!isFinite(log_scale) || isNaN(log_scale) ||
        !isFinite(log_range_width) || isNaN(log_range_width))
      return true;
  }

  return false;
};

export default DygraphDefaultScale;

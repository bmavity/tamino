var sarastro = require('sarastro')
	, util = require('util')
	, events = require('events')
	, handlers = {}

function hasNoValue(val) {
	return val === undefined
}

function HandlerExecutor(req) {
	var me = this
	this._req = req

	function emitResult(err, result) {
		if(err) return me.emit('error', err)
		me.emit('result', result)
	}

	function execute() {
		var handler = handlers[req.path]	
		console.log(req.path, handler, handlers)
		if(!handler) return me.emit('invalid')

		var vals = handler.args.map(me.resolveValue, me)

		if(vals.some(hasNoValue)) return me.emit('invalid')

		vals.push(emitResult)

		handler.fn.apply({}, vals)
	}
	events.EventEmitter.call(me)

	process.nextTick(execute)
}
util.inherits(HandlerExecutor, events.EventEmitter)

HandlerExecutor.prototype.resolveValue = function(arg) {
	var val
	if(this._req.params) {
		val = this._req.params[arg]
	}
	if(hasNoValue(val)) {
		val = this._req.query[arg]
	}
	return val
}

function wotan(req) {
	return new HandlerExecutor(req)
}

function registerHandler(path, fn) {
	var args = sarastro(fn)
	args.pop()
	handlers[path] = {
		args: args
	, fn: fn
	}
}


module.exports = wotan
module.exports.registerHandler = registerHandler
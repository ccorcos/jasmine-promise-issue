
// some basic promise utilies
function delay(ms) {
  return new Promise(function(resolve, reject) {
    setTimeout(resolve, ms)
  })
}

function defer() {
  var resolve, reject;
  var promise = new Promise(function(res,rej) {
    resolve = res
    reject = rej
  })
  return {promise:promise, resolve:resolve, reject:reject}
}

function timeout(promise, ms) {
  var result = defer()
  function resolve(x) {
    result && result.resolve(x)
    result = null
  }
  function reject(x) {
    result && result.reject(x)
    result = null
  }
  promise.then(resolve).catch(reject)
  setTimeout(function() {
    result && result.reject({code: 'timeout'})
    result = null
  }, ms)
  return result.promise
}


// some tests
describe("clock pollution", function() {
  
  // the send function will send http requests using window.fetch()
  // but these requests can timeout and retry
  var timeout_limit = 2000
  function send(retries) {
    var result = defer()
    function onSuccess(response) {
      console.log("onSuccess")
      result.resolve(response)
    }
    function onError(error) {
      console.log("onError")
      result.reject(error)
    }
    function retry() {
      console.log("retry")
      send(retries - 1).then(onSuccess).catch(onError)
    }
    timeout(window.fetch(), timeout_limit)
      .then(onSuccess)
      .catch(function(error) {
        if (error.code === "timeout" && retries > 0) {
          retry()
        } else {
          onError(error)
        }
    })
    return result.promise
  }
  
  // each of these tests work individually but not together.
  xit("timeout with no retries", function(done) {
    jasmine.clock().install()
    
    // return a promise that will never resolve so the request will timeout
    spyOn(window, 'fetch').and.callFake(function() { return new Promise(function() {}) })

    send(0).catch(function(error) {
      expect(window.fetch.calls.count()).toEqual(1)
      expect(error.code).toEqual('timeout')
      jasmine.clock().uninstall()
      done()
    })
    
    jasmine.clock().tick(timeout_limit+1)
    
  })
  
  it("timeout with one retry", function(done) {
    jasmine.clock().install()
    
    // return a promise that will never resolve so the request will timeout
    spyOn(window, 'fetch').and.callFake(function() { return new Promise(function() {}) })

    send(1).catch(function(error) {
      expect(error.code).toEqual('timeout')
      jasmine.clock().uninstall()
      done()
    })
    
    jasmine.clock().tick(timeout_limit+1)
    expect(window.fetch.calls.count()).toEqual(2)
    jasmine.clock().tick(timeout_limit+1)
    
  })

})
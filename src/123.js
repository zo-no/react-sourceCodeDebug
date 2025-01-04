function spawn(genF) {
  return new Promise(function (resolve, reject) {
    const gen = genF()
    step(() => gen.next(undefined))
  })
}

function step(nextF) {
  let next
  try {
    next = nextF()
  } catch (e) {
    return reject(e)
  }

  if (next.done) return resolve(next.value)

  Promise.resolve(next.value).then(
    function (v) {
      step(() => gen.next(v))
    },
    function (e) {
      step(() => gen.throw(e))
    }
  )
}

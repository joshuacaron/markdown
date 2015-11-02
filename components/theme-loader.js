var themesObject = JSON.parse(themes)
console.log(themes)

function getTheme(thm) {
  return themesObject[thm]
}

module.exports = getTheme

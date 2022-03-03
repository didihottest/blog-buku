// apakah login ?
function checkAuthenticated(req, res, next) {
  // is authenticated return nya true atau false
  // true kalau ada user login, false kalau user tidak login
  // kalau login lanjut ke controller atau fungsi berikutnya
  if (req.isAuthenticated()) {
    next()
  } else {
    // kalau gak login 
    res.redirect('/login')
  }
}

// apakah tidak login ?
// tujuan nya agar user tidak bisa login 2 kali atau register lagi padahal sudah login
function checkNotAuthenticated(req, res, next) {
  // kalau udah login arahin ke root
  if (req.isAuthenticated()) {
    res.redirect('/')
  } else {
    // kalau belum lanjut
    next()
  }

}

module.exports = {
  checkAuthenticated,
  checkNotAuthenticated
}
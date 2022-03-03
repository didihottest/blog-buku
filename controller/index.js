const { Book, File, User } = require('../models')
const { Op } = require('sequelize')
const fs = require('fs')
const bcrypt = require('bcrypt')

// controller untuk halaman home page
const Home = async (req, res) => {

  const { success, error } = req.flash()
  const page = Number(req.query.page) || 1
  const { author_name, title, description, release_date_from, release_date_to } = req.query
  const itemPerPage = 6

  const where = {}
  // hanya cari authorname ketika user input authorname nya di search bar
  // pencarian ilike adalah pencarian yang case insensitive
  if (author_name) {
    where['author_name'] = { [Op.iLike]: `%${author_name}%` }
  }

  if (title) {
    where['title'] = { [Op.iLike]: `%${title}%` }
  }

  if (description) {
    where['description'] = { [Op.iLike]: `%${description}%` }
  }

  // if (release_date) {
  //   where['release_date'] = release_date
  // }


  // antara tanggal
  if (release_date_from && release_date_to) {
    where['release_date'] = { [Op.between]: [release_date_from, release_date_to] }
  } else if (release_date_from) {
    // tanggal lebih dari
    where['release_date'] = { [Op.gte]: release_date_from }
    // tanggal kurang dari
  } else if (release_date_to) {
    where['release_date'] = { [Op.lte]: release_date_to }

  }


  const daftarBuku = await Book.findAndCountAll({
    distinct: true,
    // subQuery: false,
    where: where,
    include: ['image'],
    order: [['createdAt', 'DESC']],
    offset: (page - 1) * itemPerPage,
    limit: itemPerPage,
    // skip 6 data pertama karena pagination
    // halaman(2) - 1 * jumlah yang ditampilkan (6) = 6
    // halaman(3) - 1 * jumlah yang ditampilkan (6) = 6
  })
  console.log(req.user)

  res.render('home', {
    data: daftarBuku.rows,
    currentPage: page,
    totalPage: Math.ceil(daftarBuku.count / itemPerPage),
    nextPage: page + 1,
    previousPage: (page - 1) == 0 ? 1 : (page - 1),
    query: req.query,
    success: success,
    error: error,
    // req.user akan otomatis ada data user yang login jika user nya sudah login
    // kalau belum req.user nilainya null
    username: req.user ? req.user.name : null
  })
}

// untuk render halaman create buku baru
const CreateBook = (req, res) => {
  res.render('createBook', {
    username: req.user ? req.user.name : null
  })
}

// untuk create new book
const CreateBookFunction = async (req, res,) => {
  // req.file untuk upload single
  // req.files untuk upload multiple
  console.log(req.files)
  // hasil output req.files
  // [
  //   {
  //     fieldname: 'image',
  //     originalname: 'julia-kicova-g827ZOCwt30-unsplash.jpg',
  //     encoding: '7bit',
  //     mimetype: 'image/jpeg',
  //     destination: 'C:\\Users\\didi_\\chapter7-mvc\\utils/../public/images',
  //     filename: 'julia-kicova-g827ZOCwt30-unsplash-6925.jpg',
  //     path: 'C:\\Users\\didi_\\chapter7-mvc\\public\\images\\julia-kicova-g827ZOCwt30-unsplash-6925.jpg',
  //     size: 2014586
  //   },
  //   {
  //     fieldname: 'image',
  //     originalname: 'alif-caesar-rizqi-pratama-loUlSOXL81c-unsplash.jpg',
  //     encoding: '7bit',
  //     mimetype: 'image/jpeg',
  //     destination: 'C:\\Users\\didi_\\chapter7-mvc\\utils/../public/images',
  //     filename: 'alif-caesar-rizqi-pratama-loUlSOXL81c-unsplash-3091.jpg',
  //     path: 'C:\\Users\\didi_\\chapter7-mvc\\public\\images\\alif-caesar-rizqi-pratama-loUlSOXL81c-unsplash-3091.jpg',
  //     size: 432345
  //   },
  //   {
  //     fieldname: 'image',
  //     originalname: 'fang-wei-lin-H1IRUS1vEFA-unsplash.jpg',
  //     encoding: '7bit',
  //     mimetype: 'image/jpeg',
  //     destination: 'C:\\Users\\didi_\\chapter7-mvc\\utils/../public/images',
  //     filename: 'fang-wei-lin-H1IRUS1vEFA-unsplash-4596.jpg',
  //     path: 'C:\\Users\\didi_\\chapter7-mvc\\public\\images\\fang-wei-lin-H1IRUS1vEFA-unsplash-4596.jpg',
  //     size: 807648
  //   }
  // ]

  const { author_name, title, description, release_date } = req.body
  // penulisan menggunakan then
  Book.create({
    author_name,
    title,
    description,
    release_date
  }).then(async (data) => {
    // jika user upload foto
    if (req.files.length > 0) {
      // karena bentuknya array kita perlu looop untuk simpan file nya satu persatu ke db file
      for (const item of req.files) {
        await File.create({
          file_url: `/images/${item.filename}`,
          file_name: item.filename,
          file_size: item.size,
          original_filename: item.originalname,
          owner_uuid: data.uuid,
        })
      }
    }
    // berikan pesan success kepada route / atau route home ketika pembuatan buku berhasil
    // req.flash hanya akan bisa dibaca data nya kalau ada res.redirect
    // tentukan flash message sebelum proses redirect dilakukan
    req.flash('success', 'New Book Created')
    res.redirect('/')
  }).catch((error) => {
    // berikan pesan error kepada route / atau route home ketika pembuatan buku gagal
    req.flash('error', error.message)
    console.log('====================================');
    console.log(error);
    console.log('====================================');
    res.redirect('/')
  })

  // cara kedua pakai async await
  // try {
  //   const newBook = await Book.create({
  //     author_name,
  //     title,
  //     description,
  //     release_date
  //   })

  //   if (newBook) {
  //     res.redirect('/')
  //   }
  // } catch (error) {
  //   console.log('====================================');
  //   console.log(error);
  //   console.log('====================================');
  //   res.redirect('/')
  // }
}

// untuk render halaman detail buku
const Singlebook = async (req, res) => {
  const user = req.user
  const singleBook = await Book.findOne({
    where: {
      uuid: req.params.id
    }
  })


  res.render('singleBook', {
    data: singleBook,
    username: req.user ? req.user.name : null
  })
}

// untuk render halaman edit buku
const EditBook = async (req, res, next) => {
  try {
    const singleBook = await Book.findOne({
      where: {
        uuid: req.params.id
      }
    })

    // jika buku dengan uuid yang dimasukin dari params browser nya ada
    // render halaman buku
    if (singleBook) {
      res.render('editBook', {
        data: singleBook,
        username: req.user ? req.user.name : null

      })
    } else {
      next()
    }
  } catch (error) {
    next()
  }



}


// untuk Edit book
const EditBookFunction = async (req, res,) => {
  const { author_name, title, description, release_date } = req.body

  try {
    const bookToUpdate = await Book.findOne({
      where: {
        uuid: req.params.id
      },
      include: ['image']
    })
    console.log('====================================');
    console.log(req.files);
    console.log('====================================');

    // kalau user upload gambar baru
    if (req.files.length > 0) {
      // buat gambar baru di table file
      for (const item of req.files) {
        await File.create({
          file_url: `/images/${item.filename}`,
          file_name: item.filename,
          file_size: item.size,
          original_filename: item.originalname,
          owner_uuid: bookToUpdate.uuid,
        })
      }
      // check apakah buku punya gambar sebelumnya
      if (bookToUpdate.image.length > 0) {
        // lakukan proses delete gambar kalau ada gambarnya
        for (const oldImage of bookToUpdate.image) {
          // delete entry gambar di table file yang digunakan untuk mencatat kepemilikan gambar 
          await File.destroy({
            where: {
              uuid: oldImage.uuid
            }
          })
          // delete gambar yang ada di folder public
          fs.rmSync(__dirname + '/../public' + oldImage.file_url)
        }
      }
    }
    const bookUpdated = await bookToUpdate.update({
      author_name,
      title,
      description,
      release_date
    })

    if (bookUpdated) {
      req.flash('success', 'Book Edited Successfully')
      res.redirect('/')
    }
  } catch (error) {
    req.flash('error', error.message)

    console.log('====================================');
    console.log(error);
    console.log('====================================');
    res.redirect('/')
  }
}

// untuk Delete book
const DeleteBookFunction = async (req, res,) => {
  try {

    const bookToDelete = await Book.findOne({
      where: {
        uuid: req.params.id
      },
      include: ['image']
    })

    if (bookToDelete.image.length > 0) {
      for (const imageToDelete of bookToDelete.image) {
        await File.destroy({
          where: {
            uuid: imageToDelete.uuid
          }
        })
        fs.rmSync(__dirname + '/../public' + imageToDelete.file_url)
      }
    }

    await bookToDelete.destroy()

    if (bookToDelete) {
      req.flash('success', 'Book Deleted Successfully')
      res.redirect('/')
    }
  } catch (error) {
    req.flash('error', error.message)
    console.log('====================================');
    console.log(error);
    console.log('====================================');
    res.redirect('/')
  }
}

// render halaman registrasi

const Register = (req, res, next) => {
  const { success, error } = req.flash()
  res.render('register', {
    success,
    error
  })
}

const RegisterFunction = async (req, res, next) => {
  try {
    // check apakah password dan confirm passwordnya sama
    if (req.body.password1 !== req.body.password2) {
      req.flash('error', 'Password yang anda masukkan tidak cocok')
      res.redirect('/register')
    } else {
      // create new user
      const hashedPassword = await bcrypt.hash(req.body.password1, 10)
      await User.create({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
      })
      req.flash('success', 'User Registered Successfully')
      res.redirect('/login')
    }
  } catch (error) {
    req.flash('error', error.message)
    console.log('====================================');
    console.log(error);
    console.log('====================================');
    res.redirect('/register')
  }

}

const Login = (req, res, next) => {
  try {
    const { success, error } = req.flash()
    res.render('login', {
      success,
      error
    })
  } catch (error) {
    req.flash('error', error.message)
    console.log('====================================');
    console.log(error);
    console.log('====================================');
    res.redirect('/')
  }

}

// untuk logout
const Logout = (req, res, next) => {
  req.logOut()
  res.redirect('/login')
}
module.exports = {
  Home,
  CreateBook,
  CreateBookFunction,
  Singlebook,
  EditBook,
  EditBookFunction,
  DeleteBookFunction,
  Register,
  RegisterFunction,
  Login,
  Logout
}
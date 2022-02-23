const { Book, File } = require('../models')
const fs = require('fs')

// controller untuk halaman home page
const Home = async (req, res) => {
  const daftarBuku = await Book.findAll({
    include: ['image']
  })
  // console.log(daftarBuku);
  res.render('home', {
    data: daftarBuku
  })
}

// untuk render halaman create buku baru
const CreateBook = (req, res) => {
  res.render('createBook')
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
    res.redirect('/')
  }).catch((error) => {
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

  const singleBook = await Book.findOne({
    where: {
      uuid: req.params.id
    }
  })


  res.render('singleBook', {
    data: singleBook
  })
}

// untuk render halaman edit buku
const EditBook = async (req, res) => {

  const singleBook = await Book.findOne({
    where: {
      uuid: req.params.id
    }
  })


  res.render('editBook', {
    data: singleBook
  })
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
      res.redirect('/')
    }
  } catch (error) {
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
      res.redirect('/')
    }
  } catch (error) {
    console.log('====================================');
    console.log(error);
    console.log('====================================');
    res.redirect('/')
  }
}



module.exports = {
  Home,
  CreateBook,
  CreateBookFunction,
  Singlebook,
  EditBook,
  EditBookFunction,
  DeleteBookFunction
}
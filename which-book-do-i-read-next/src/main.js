const got = require('got')
const xml = require('xml2js')
const fs = require('fs')

const url = `https://www.goodreads.com/review/list/44142338-marco-l-thy?shelf=to-read&sort=avg_rating&per_page=200&format=xml&key=${process.env.GOODREADS_API_KEY}`

const sortDescending = (a, b) => {
  if (a > b) {
    return -1
  }
  if (a < b) {
    return 1
  }
  return 0
}

const filterCleanData = book =>
  // book pages
  book.num_pages &&
  !isNaN(Number(book.num_pages)) &&
  Number(book.num_pages) > 20 &&
  // book year
  book.publication_year &&
  !isNaN(Number(book.publication_year)) &&
  book.publicationYear > 0 &&
  // not future book
  Number(book.publication_year) <= new Date().getFullYear()

const filterNonFiction = book =>
  ![
    'George Orwell',
    'Philip Pullman',
    'Douglas Adams',
    'T.S. Eliot',
    'Frank Herbert',
    'Kurt Vonnegut',
  ].includes(book.authors[0].author[0].name[0])

async function fetchAllBooks(page = 1) {
  const result = await got(`${url}&page=${page}`)
  const {
    GoodreadsResponse: {
      books: [data],
    },
  } = await xml.parseStringPromise(result.body)

  const pageinfo = data.$
  const nextpage = page + 1

  console.log(pageinfo)

  return [
    ...data.book,
    ...(nextpage <= pageinfo.numpages ? await fetchAllBooks(nextpage) : []),
  ]
}

const CACHE_FILE = 'cached.json'
async function getData() {
  if (fs.existsSync(CACHE_FILE)) {
    return require('../' + CACHE_FILE)
  }

  const books = await fetchAllBooks()

  const cleanData = books.map(book => ({
    ...book,
    author: book.authors[0].author[0].name[0],
    averageRating: Number(book.average_rating[0]),
    ratingsCount: Number(book.ratings_count[0]),
    publicationYear: Number(book.publication_year[0]),
    numPages: Number(book.num_pages[0]),
  }))

  fs.writeFileSync(CACHE_FILE, JSON.stringify(cleanData, null, 2))

  return cleanData
}

function render(heading, books, limit = 5) {
  console.log(`\n\n------\n${heading}\n______\n\n`)

  console.log(
    books
      .sort((book1, book2) =>
        sortDescending(book1.weightedRating, book2.weightedRating)
      )
      .slice(0, limit)
      .map(
        book => `
Title: ${book.title}
Author: ${book.author}
Avg: ${book.averageRating} (${book.ratingsCount} ratings) — Weight: ${book.weightedRating}, ${book.numPages} pages, ${book.publicationYear}
${book.link}
`
      )
      .join('\n')
  )
}

async function main() {
  const data = await getData()
  const books = data.filter(filterCleanData).filter(filterNonFiction)

  const totalBooks = books.length
  const ratingCountSum = books.reduce((sum, book) => sum + book.ratingsCount, 0)

  const ratingAvgSum = books.reduce((sum, book) => sum + book.averageRating, 0)

  render(
    'Most popular shortest recent best',
    books.map(book => ({
      ...book,
      weightedRating:
        book.averageRating *
        book.ratingsCount *
        (1 / book.numPages) *
        (1 / (new Date().getFullYear() + 1 - book.publicationYear)),
    }))
  )

  render(
    'i dunno',
    books.map(book => ({
      ...book,
      weightedRating:
        book.averageRating * book.ratingsCount -
        (5 - book.averageRating) * book.ratingsCount,
    }))
  )

  render(
    'Longest recent best',
    books.map(book => ({
      ...book,
      weightedRating:
        book.averageRating *
        book.numPages *
        (1 / (new Date().getFullYear() + 1 - book.publicationYear)),
    }))
  )

  render(
    'Recent best',
    books.map(book => ({
      ...book,
      weightedRating:
        book.averageRating *
        (1 / (new Date().getFullYear() + 1 - book.publicationYear)),
    }))
  )

  render(
    'Shortest recent best',
    books.map(book => ({
      ...book,
      weightedRating:
        book.averageRating *
        (1 / book.numPages) *
        (1 / (new Date().getFullYear() + 1 - book.publicationYear)),
    }))
  )
}

main()

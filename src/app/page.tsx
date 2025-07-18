'use client'

import React, { useEffect, useState } from 'react'
import Search from './components/Search'
import MovieCard from './components/MovieCard'
import Spinner from './components/spinners'
import { useDebounce } from 'react-use'

const API_BASE_URL = 'https://api.themoviedb.org/3'
const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`,
  },
}

type TMDBMovie = {
  id: number
  title: string
  overview: string
  poster_path: string
  release_date: string
  vote_average: number
  original_language: string
}

type TrendingMovie = {
  $id: string
  title: string
  poster_url: string
}

const Page = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [movieList, setMovieList] = useState<TMDBMovie[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [debounceSearchTerm, setDebounceSearchTerm] = useState('')
  const [trendingMovies, setTrendingMovies] = useState<TrendingMovie[]>([])

  useDebounce(() => setDebounceSearchTerm(searchTerm), 500, [searchTerm])

  const fetchMovies = async (query = '') => {
    if (!API_KEY) {
      console.error('Missing TMDB API key')
      return
    }

    setIsLoading(true)
    setErrorMessage('')

    try {
      const endPoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc&language=en-US&page=1`

      const response = await fetch(endPoint, API_OPTIONS)
      if (!response.ok) throw new Error('Failed to fetch')

      const data = await response.json()
      if (data.Response === 'False') {
        setErrorMessage(data.Error || 'Failed to fetch')
        setMovieList([])
        return
      }

      setMovieList(data.results || [])

      if (query && data.results.length > 0) {
        await fetch('/api/appwrite-function', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ searchTerm: query, movie: data.results[0] }),
        })
      }
    } catch (error) {
      console.error(`Error fetching movies:`, error)
      setErrorMessage('Error fetching movies, please try again')
    } finally {
      setIsLoading(false)
    }
  }

  const loadTrendingMovies = async () => {
    try {
      const response = await fetch('/api/appwrite-function', {
        method: 'GET',
      })

      const json = await response.json()
      const docs = json.movies || []
      const movies: TrendingMovie[] = docs.map((doc: any) => ({
        $id: doc.$id,
        title: doc.title,
        poster_url: doc.poster_url,
      }))
      setTrendingMovies(movies)
    } catch (error) {
      console.error(`Error fetching trending movies:`, error)
    }
  }

  useEffect(() => {
    fetchMovies(debounceSearchTerm)
  }, [debounceSearchTerm])

  useEffect(() => {
    loadTrendingMovies()
  }, [])

  return (
    <main>
      <div className="pattern" />
      <div className="wrapper">
        <header>
          <img src="./logo.png" alt="logo" className="w-24 h-24 object-contain" />
          <img src="./hero-img.png" alt="hero" />
          <h1>
            Find <span className="text-gradient">Movies</span> You'll Enjoy Without The Hassle
          </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>
            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="all-movies">
          <h2 className="mt-[40px]">All Movies</h2>
          {isLoading ? (
            <Spinner />
          ) : (
            <ul>
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}

export default Page

import React, { useState, useMemo } from 'react';
import { COURSES } from '../data/mockData';
import { FilterChips, Card, Badge, Button, SearchBar } from '../components/ui';
import './CourseRecommendations.css';

const ALL_CATEGORIES = ['All', ...new Set(COURSES.map((c) => c.skillCategory))];
const PRICE_OPTIONS = ['All', 'Free', 'Paid'];
const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' }
];

function StarRating({ rating }) {
  const full = Math.floor(rating);
  const partial = rating - full;
  const stars = [];
  for (let i = 0; i < 5; i++) {
    if (i < full) stars.push('★');
    else if (i === full && partial >= 0.5) stars.push('★');
    else stars.push('☆');
  }
  return (
    <span className="star-rating" aria-label={`${rating} out of 5 stars`}>
      {stars.join('')} <span className="star-rating__value">{rating}</span>
    </span>
  );
}

export default function CourseRecommendations() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [priceFilter, setPriceFilter] = useState('All');
  const [sort, setSort] = useState('popular');

  const filteredCourses = useMemo(() => {
    let list = [...COURSES];

    /* search */
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.provider.toLowerCase().includes(q) ||
          c.skillCategory.toLowerCase().includes(q)
      );
    }

    /* category */
    if (category && category !== 'All') {
      list = list.filter((c) => c.skillCategory === category);
    }

    /* price */
    if (priceFilter === 'Free') {
      list = list.filter((c) => c.price === 'Free');
    } else if (priceFilter === 'Paid') {
      list = list.filter((c) => c.price !== 'Free');
    }

    /* sort */
    if (sort === 'popular') {
      list.sort((a, b) => b.enrolledCount - a.enrolledCount);
    } else if (sort === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [search, category, priceFilter, sort]);

  return (
    <div className="courses-page">
      <div className="courses-header">
        <h1>Course Recommendations</h1>
        <p className="courses-header__subtitle">
          Build the skills you need to stand out
        </p>
      </div>

      {/* ── Search ── */}
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search courses..."
      />

      {/* ── Filters ── */}
      <div className="courses-filters">
        <div className="courses-filters__section">
          <span className="courses-filters__label">Category</span>
          <FilterChips
            options={ALL_CATEGORIES}
            selected={category}
            onChange={(val) => setCategory(val || 'All')}
          />
        </div>

        <div className="courses-filters__section">
          <span className="courses-filters__label">Price</span>
          <FilterChips
            options={PRICE_OPTIONS}
            selected={priceFilter}
            onChange={(val) => setPriceFilter(val || 'All')}
          />
        </div>

        <div className="courses-filters__sort">
          <label htmlFor="course-sort" className="courses-filters__label">
            Sort by
          </label>
          <select
            id="course-sort"
            className="courses-sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Results Count ── */}
      <div className="courses-results-count">
        <Badge variant="info">{filteredCourses.length} courses found</Badge>
      </div>

      {/* ── Course Grid ── */}
      <div className="courses-grid">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="course-card">
            <div className="course-card__header">
              <Badge className="course-card__provider">{course.provider}</Badge>
              <span
                className={`course-card__price ${
                  course.price === 'Free' ? 'course-card__price--free' : 'course-card__price--paid'
                }`}
              >
                {course.price}
              </span>
            </div>

            <h3 className="course-card__title">{course.title}</h3>
            <p className="course-card__desc">{course.description}</p>

            <div className="course-card__meta">
              <StarRating rating={course.rating} />
              <span className="course-card__enrolled">
                👥 {course.enrolledCount.toLocaleString()} enrolled
              </span>
            </div>

            <div className="course-card__footer">
              <span className="course-card__duration">⏱ {course.duration}</span>
              <Button size="sm">Enroll</Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="courses-empty">
          <span className="courses-empty__icon">📚</span>
          <p>No courses match your filters. Try adjusting your search.</p>
        </div>
      )}
    </div>
  );
}

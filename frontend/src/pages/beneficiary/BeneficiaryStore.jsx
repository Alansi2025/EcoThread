import React, { useState, useEffect } from 'react';
import { catalogApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ProductCard } from './ProductCard';
import { ProductDetailModal } from './ProductDetailModal';
import { CartDrawer } from './CartDrawer';
import { OrderHistoryModal } from './OrderHistoryModal';
import { 
  Search, 
  Filter, 
  Coins, 
  Clock, 
  ShoppingBag, 
  Sparkles, 
  SlidersHorizontal,
  RotateCcw,
  ArrowUpDown,
  CheckCircle2
} from 'lucide-react';

const CATEGORIES = [
  'All Categories',
  'Outerwear',
  'Shirts & Blouses',
  'Denims & Bottoms',
  'Ethnic & Traditional',
  'Kids Wear',
  'Tops & Knitwear',
];

const GENDERS = ['All', 'Men', 'Women', 'Kids'];
const SIZES = ['All', 'XS', 'S', 'M', 'L', 'XL'];
const SEASONS = ['All', 'Winter', 'Summer', 'Monsoon'];

export const BeneficiaryStore = ({ onOpenCart }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedGender, setSelectedGender] = useState('All');
  const [selectedSize, setSelectedSize] = useState('All');
  const [selectedSeason, setSelectedSeason] = useState('All');
  const [sortBy, setSortBy] = useState('recommended'); // 'recommended', 'price_asc', 'price_desc', 'name_asc'
  const [onlyAvailable, setOnlyAvailable] = useState(true);

  const [selectedItemForModal, setSelectedItemForModal] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchQuery.trim()) params.q = searchQuery.trim();
      if (selectedCategory !== 'All Categories') params.category = selectedCategory;
      if (selectedGender !== 'All') params.gender = selectedGender;
      if (selectedSize !== 'All') params.size = selectedSize;
      if (selectedSeason !== 'All') params.season = selectedSeason;

      const res = await catalogApi.getCatalog(params);
      setItems(res.data || []);
    } catch (err) {
      console.error('Failed to load catalog', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, [selectedCategory, selectedGender, selectedSize, selectedSeason]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCatalog();
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All Categories');
    setSelectedGender('All');
    setSelectedSize('All');
    setSelectedSeason('All');
    setSortBy('recommended');
    setOnlyAvailable(true);
  };

  const handleOpenDetailModal = (item) => {
    setSelectedItemForModal(item);
    setIsDetailModalOpen(true);
  };

  // Filter & Sort items
  const processedItems = items
    .filter((item) => (onlyAvailable ? item.isAvailable : true))
    .sort((a, b) => {
      if (sortBy === 'price_asc') return (a.creditCost || 0) - (b.creditCost || 0);
      if (sortBy === 'price_desc') return (b.creditCost || 0) - (a.creditCost || 0);
      if (sortBy === 'name_asc') return a.title.localeCompare(b.title);
      return (b.id || 0) - (a.id || 0); // default newest
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fadeIn">
      
      {/* Amazon-style Storefront Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-amber-950 via-orange-950 to-slate-900 text-white p-6 sm:p-8 mb-6 overflow-hidden shadow-xl border border-amber-900/50">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-2 border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Certified Grade-A Cleaned & Refurbished Garments</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold font-['Outfit']">
              Beneficiary Seasonal Store 🛍️
            </h1>
            <p className="text-xs sm:text-sm text-amber-100/80 mt-1 max-w-xl">
              Choose winter essentials, work shirts, and children's school wear. Checkout at zero cost with your monthly NGO seasonal allowance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOrderHistoryOpen(true)}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3.5 py-2.5 rounded-xl text-xs font-semibold border border-white/20 transition-all"
            >
              <Clock className="w-4 h-4 text-amber-300" />
              <span>Order Tracking</span>
            </button>
            <button
              onClick={onOpenCart}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-amber-500/20 active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Open Cart Drawer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar & Category Scroller */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 mb-6 shadow-xs space-y-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by garment title, jacket, cotton shirt, kurti, jeans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden px-3 py-2 bg-slate-100 rounded-xl text-slate-700 flex items-center justify-center"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </form>

        {/* Horizontal Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 pt-1 text-xs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full whitespace-nowrap font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-700 text-white font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Left Filters + Right Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Left Filter Sidebar */}
        <aside className={`md:block ${mobileFilterOpen ? 'block' : 'hidden'} md:col-span-1 space-y-5 bg-white p-5 rounded-3xl border border-slate-200 self-start shadow-xs`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-amber-600" />
              <span>Filters & Sorting</span>
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-[11px] text-slate-400 hover:text-amber-700 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Sort By Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <span>Sort Garments</span>
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="recommended">Featured / Newest Intake</option>
              <option value="price_asc">Credit Allowance: Free to High</option>
              <option value="price_desc">Credit Allowance: High to Free</option>
              <option value="name_asc">Garment Title (A - Z)</option>
            </select>
          </div>

          {/* Gender Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">Target Demographic</label>
            <div className="space-y-1.5 text-xs">
              {GENDERS.map((g) => (
                <label key={g} className="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-slate-900">
                  <input
                    type="radio"
                    name="gender"
                    checked={selectedGender === g}
                    onChange={() => setSelectedGender(g)}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <span>{g}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Size Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">Size</label>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              {SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedSize(s)}
                  className={`py-1.5 rounded-lg border font-medium transition-all ${
                    selectedSize === s
                      ? 'bg-amber-600 text-white border-amber-600 font-bold'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Season Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">Season</label>
            <div className="space-y-1.5 text-xs">
              {SEASONS.map((season) => (
                <label key={season} className="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-slate-900">
                  <input
                    type="radio"
                    name="season"
                    checked={selectedSeason === season}
                    onChange={() => setSelectedSeason(season)}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <span>{season}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Quality Assurance Note */}
          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-[11px] text-emerald-900 space-y-1">
            <div className="font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>EcoThread Hygiene Standard</span>
            </div>
            <p className="text-emerald-800/80 leading-relaxed">
              Every item has passed industrial hospital-grade UV sterilization and button/zipper inspection.
            </p>
          </div>
        </aside>

        {/* Right Product Grid */}
        <main className="md:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs text-slate-500 font-medium">
              Showing <span className="font-bold text-slate-900">{processedItems.length}</span> verified Grade-A garments
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-72 bg-white rounded-3xl border border-slate-200 animate-pulse p-4 flex flex-col justify-between">
                  <div className="h-40 bg-slate-200 rounded-2xl mb-3"></div>
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : processedItems.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-sm text-slate-800">No garments match current filters</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try resetting demographic, season, or category filters to view other available stock.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-all"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {processedItems.map((item) => (
                <ProductCard 
                  key={item.id} 
                  item={item} 
                  onQuickView={handleOpenDetailModal}
                />
              ))}
            </div>
          )}
        </main>

      </div>

      {/* Garment Detail & QC Inspection Modal */}
      <ProductDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        item={selectedItemForModal}
      />

      {/* Order History Modal */}
      <OrderHistoryModal
        isOpen={isOrderHistoryOpen}
        onClose={() => setIsOrderHistoryOpen(false)}
      />
    </div>
  );
};

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  DollarSign,
  Search,
  Star,
  Loader2,
  TrendingUp,
  HeadphonesIcon,
} from "lucide-react";
import axios from "axios";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import lightimg from "../assets/hero-light.jpg"
import darktimg from "../assets/hero-dark.jpg"
import { FilterComponent } from "@/components/FilterComponent";

import { useTranslation } from "react-i18next"; // <-- Import i18n

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL;

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(); // <-- Initialize translation hook

  
 // Home.tsx - CORRECTED Logic

const handleSearch = (filters: { city: string; priceLevel: string; sortBy: string }) => {
  const params = new URLSearchParams();
  
  if (filters.city) params.append("city", filters.city);
  if (filters.priceLevel) params.append("priceLevel", filters.priceLevel);
  
  // --- START OF FIX: Translate the sortBy value ---
  if (filters.sortBy && filters.sortBy !== 'default') {
    let backendSortParam: string | null = null;

    if (filters.sortBy === 'nearest') {
      // User selected 'Nearest' -> API expects 'radius'
      backendSortParam = 'radius';
    } else if (filters.sortBy === 'highRating') {
      // User selected 'Highest Rating' -> API expects 'rating'
      backendSortParam = 'rating';
    }

    if (backendSortParam) {
      params.append("sortBy", backendSortParam);
    }
  }
  // --- END OF FIX ---

  navigate(`/listings?${params.toString()}`);
};
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-gray-900">
        {/* Hero Section */}
        <div className="relative h-[600px] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" />
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40 dark:opacity-0"
            style={{ backgroundImage: `url(${lightimg})` }}
          />
           {/* Dark Mode Image */}
           <div
              
              className="absolute inset-0 bg-cover bg-center opacity-40 hidden dark:block"
            style={{ backgroundImage: `url(${darktimg})` }}
          />

          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

          <div className="relative z-10 text-center px-4 max-w-4xl">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              {t("home.hero.title")}
            </h1>
            <p className="text-xl text-white/90 mb-8">
              {t("home.hero.subtitle")}
            </p>
{/* Filter Section */}
            <FilterComponent
              onSearch={ handleSearch}
              showSearchButton={true}
              variant="home"
              apiBaseUrl={API_BASE_URL}
            />
         {/* 
          */}
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white py-24 dark:bg-[#0f1729] ">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 dark:text-white">
                {t("home.features.title")}
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto dark:text-gray-300">
                {t("home.features.subtitle")}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-12">
              {/* Feature 1 */}
              <div className="group text-center transform hover:scale-105 transition-all duration-300 bg-gray-50 rounded-2xl p-8 shadow-lg hover:shadow-2xl border border-gray-100 dark:bg-[#1e293b]">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-red-200 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative bg-gradient-to-br from-[#ef4343] to-[#d63030] w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-xl">
                    <MapPin className="w-12 h-12 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                  {t("home.features.feature1.title")}
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed dark:text-gray-300">
                  {t("home.features.feature1.desc")}
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group text-center transform hover:scale-105 transition-all duration-300 bg-gray-50 rounded-2xl p-8 shadow-lg hover:shadow-2xl border border-gray-100 dark:bg-[#1e293b]">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-red-200 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative bg-gradient-to-br from-[#ef4343] to-[#d63030] w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-xl">
                    <DollarSign className="w-12 h-12 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                  {t("home.features.feature2.title")}
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed dark:text-gray-300">
                  {t("home.features.feature2.desc")}
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group text-center transform hover:scale-105 transition-all duration-300 bg-gray-50 rounded-2xl p-8 shadow-lg hover:shadow-2xl border border-gray-100 dark:bg-[#1e293b]">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-red-200 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative bg-gradient-to-br from-[#ef4343] to-[#d63030] w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-xl">
                    <Star className="w-12 h-12 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                  {t("home.features.feature3.title")}
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed dark:text-gray-300">
                  {t("home.features.feature3.desc")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Section (Translated) */}
        <div className="bg-gradient-to-b from-slate-50 to-white ">
          <div className="py-24 px-4 dark:bg-[#0f1729]">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-5xl font-bold text-gray-900 mb-4 dark:text-white">
                  {t("home.stats.title")}
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto dark:text-gray-300">
                  {t("home.stats.subtitle")}
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* 1. Cities Available */}
                <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 dark:bg-[#1e293b] ">
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <MapPin className="w-10 h-10 text-white" />
                    </div>
                    <div className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-3">
                      23+
                    </div>
                    <div className="text-lg font-semibold text-gray-700 mb-2 dark:text-white">
                      {t("stats.citiesAvailable", "Cities Available")}
                    </div>
                    <p className="text-sm text-gray-500 text-center dark:text-gray-300">
                      {t(
                        "stats.exploreDestinations",
                        "Explore destinations worldwide"
                      )}
                    </p>
                  </div>
                </div>

                {/* 2. Price Levels */}
                <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 dark:bg-[#1e293b]">
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <DollarSign className="w-10 h-10 text-white" />
                    </div>
                    <div className="text-6xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent mb-3">
                      4
                    </div>
                    <div className="text-lg font-semibold text-gray-700 mb-2 dark:text-white">
                      {t("stats.priceLevels", "Price Levels")}
                    </div>
                    <p className="text-sm text-gray-500 text-center dark:text-gray-300">
                      {t("stats.optionsForBudget", "Options for every budget")}
                    </p>
                  </div>
                </div>

                {/* 3. Amazing Places */}
                <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 dark:bg-[#1e293b]">
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <TrendingUp className="w-10 h-10 text-white" />
                    </div>
                    <div className="text-6xl font-bold bg-gradient-to-r from-amber-600 to-amber-700 bg-clip-text text-transparent mb-3">
                      1000+
                    </div>
                    <div className="text-lg font-semibold text-gray-700 mb-2 dark:text-white">
                      {t("stats.amazingPlaces", "Amazing Places")}
                    </div>
                    <p className="text-sm text-gray-500 text-center dark:text-gray-300">
                      {t(
                        "stats.curatedExperiences",
                        "Curated experiences await"
                      )}
                    </p>
                  </div>
                </div>

                {/* 4. Support */}
                <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 dark:bg-[#1e293b]">
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <HeadphonesIcon className="w-10 h-10 text-white" />
                    </div>
                    <div className="text-6xl font-bold bg-gradient-to-r from-rose-600 to-rose-700 bg-clip-text text-transparent mb-3">
                      24/7
                    </div>
                    <div className="text-lg font-semibold text-gray-700 mb-2 dark:text-white">
                      {t("stats.support", "Support")}
                    </div>
                    <p className="text-sm text-gray-500 text-center dark:text-gray-300">
                      {t("stats.hereWhenNeed", "We're here whenever you need")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Home;

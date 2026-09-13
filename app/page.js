'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  Sparkles,
  ShieldCheck,
  Building2,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Search,
  SlidersHorizontal,
  BookmarkPlus,
  ExternalLink,
  Users,
  Award,
  TrendingUp,
  Landmark,
  Check,
  ChevronRight,
  Info,
  Layers,
  Clock,
  HelpCircle,
  BarChart3,
  PlusCircle,
  Trash2,
  Edit3,
  Languages,
  CheckSquare,
  Square,
  Zap,
  Globe,
  Bell,
  UserCheck,
  Percent,
  Compass,
  ArrowUpRight,
  Lock,
  ChevronDown,
  X
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast, Toaster } from 'sonner'

import { DEMO_SCHEMES } from '../lib/seedData'
import { DEMO_PERSONAS } from '../lib/demoPersonas'
import { TRANSLATIONS } from '../lib/translations'

export default function SakshamAIApp() {
  // Navigation & Active View State
  const [activeTab, setActiveTab] = useState('home') // home | find | matches | schemes | checker | applications | dashboard | admin
  const [lang, setLang] = useState('en') // en | hi | te
  const t = useMemo(() => TRANSLATIONS[lang] || TRANSLATIONS.en, [lang])

  // Data states
  const [schemes, setSchemes] = useState([])
  const [isLoadingSchemes, setIsLoadingSchemes] = useState(true)
  const [matchedResults, setMatchedResults] = useState([])
  const [isMatching, setIsMatching] = useState(false)
  const [matchingStepText, setMatchingStepText] = useState('')
  const [applications, setApplications] = useState([])
  const [isLoadingApps, setIsLoadingApps] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [adminStats, setAdminStats] = useState(null)

  // Current Active Entrepreneur Profile State
  const [userProfile, setUserProfile] = useState({
    id: 'user-default-01',
    name: 'Rameshwar Rao',
    email: 'rameshwar.rao@saksham.demo',
    phone: '+91 94401 23456',
    age: 34,
    gender: 'Male',
    state: 'Telangana',
    district: 'Warangal',
    socialCategory: 'SC',
    entrepreneurType: 'EXISTING',
    role: 'CITIZEN'
  })

  const [businessProfile, setBusinessProfile] = useState({
    businessName: 'Rao Precision Metal Fabrication',
    businessType: 'MANUFACTURING',
    industry: 'Light Engineering & Metal Works',
    businessStage: 'EARLY_STAGE',
    annualTurnover: 1200000,
    employeeCount: 6,
    udyamRegistered: 'YES',
    supportRequired: ['CAPITAL_SUBSIDY', 'FINANCE_LOAN', 'MACHINERY', 'COLLATERAL_FREE'],
    targetAmount: 2500000
  })

  // Multi-step Wizard State for "Find My Scheme"
  const [wizardStep, setWizardStep] = useState(1)

  // Scheme Directory Search & Filter State
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('ALL')
  const [filterState, setFilterState] = useState('ALL')
  const [filterType, setFilterType] = useState('ALL')

  // Selected scheme for details modal
  const [selectedScheme, setSelectedScheme] = useState(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  // Eligibility Checker State
  const [checkerSchemeId, setCheckerSchemeId] = useState('')
  const [checkerResult, setCheckerResult] = useState(null)
  const [isChecking, setIsChecking] = useState(false)

  // Demo Mode Modal
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false)
  const [selectedDemoPersonaId, setSelectedDemoPersonaId] = useState(null)

  // Admin New Scheme Modal
  const [isAdminNewSchemeOpen, setIsAdminNewSchemeOpen] = useState(false)
  const [newSchemeForm, setNewSchemeForm] = useState({
    name: '',
    shortName: '',
    department: '',
    nodalAgency: '',
    schemeType: 'CAPITAL_SUBSIDY',
    typeLabel: 'Credit Linked Capital Subsidy',
    description: '',
    minAge: 18,
    maxAge: 70,
    maxProjectCost: 2500000,
    subsidyPercentSpecial: 35,
    states: ['ALL_INDIA'],
    eligibleCategories: ['SC', 'ST', 'OBC', 'WOMEN', 'GENERAL'],
    targetCategories: ['SC', 'ST', 'WOMEN'],
    eligibleBusinessTypes: ['MANUFACTURING', 'SERVICES'],
    businessStages: ['IDEATION', 'EARLY_STAGE'],
    supportTypes: ['CAPITAL_SUBSIDY', 'FINANCE_LOAN'],
    benefits: ['Government Financial Subsidy'],
    documents: ['Aadhaar Card', 'PAN Card', 'Project Report'],
    applicationUrl: 'https://msme.gov.in',
    officialWebsite: 'https://msme.gov.in',
    deadline: 'Open All Year'
  })

  // 1. Initial Load: Schemes, Applications, Notifications
  useEffect(() => {
    fetchSchemes()
    fetchApplications()
    fetchNotifications()
    fetchAdminStats()
  }, [])

  // 1b. On first load, surface the demo fast-track so the page lands
  //     with an active profile + a real match already computed.
  useEffect(() => {
    if (!schemes.length) return
    setIsDemoModalOpen(true)
  }, [schemes.length])

  // 1c. When the demo modal first opens, pre-select the first persona and
  //     kick off the match so the user doesn't sit on an empty dialog.
  //     Reset the selection when the modal closes so a fresh auto-run happens
  //     next time it opens.
  useEffect(() => {
    if (isDemoModalOpen) {
      if (!DEMO_PERSONAS.length) return
      const firstId = DEMO_PERSONAS[0].id
      setSelectedDemoPersonaId(firstId)
      handleLoadDemoPersona(firstId).catch(() => {})
    } else {
      setSelectedDemoPersonaId(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemoModalOpen])

  const fetchSchemes = async () => {
    setIsLoadingSchemes(true)
    try {
      const res = await fetch('/api/schemes')
      const data = await res.json()
      if (data.success && Array.isArray(data.schemes)) {
        setSchemes(data.schemes)
        if (data.schemes.length > 0 && !checkerSchemeId) {
          setCheckerSchemeId(data.schemes[0].id)
        }
      } else {
        setSchemes(DEMO_SCHEMES)
      }
    } catch (err) {
      console.error('Failed to fetch schemes:', err)
      setSchemes(DEMO_SCHEMES)
    } finally {
      setIsLoadingSchemes(false)
    }
  }

  const fetchApplications = async () => {
    setIsLoadingApps(true)
    try {
      const res = await fetch(`/api/applications?userId=${userProfile.id}`)
      const data = await res.json()
      if (data.success && Array.isArray(data.applications)) {
        setApplications(data.applications)
      }
    } catch (err) {
      console.error('Failed to fetch applications:', err)
    } finally {
      setIsLoadingApps(false)
    }
  }

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`/api/notifications?userId=${userProfile.id}`)
      const data = await res.json()
      if (data.success && Array.isArray(data.notifications)) {
        setNotifications(data.notifications)
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    }
  }

  const fetchAdminStats = async () => {
    try {
      const res = await fetch('/api/admin/stats')
      const data = await res.json()
      if (data.success && data.stats) {
        setAdminStats(data.stats)
      }
    } catch (err) {
      console.error('Failed to fetch admin stats:', err)
    }
  }

  // 2. RUN AI MATCHING ENGINE
  const runMatchingEngine = async (customUser = userProfile, customBiz = businessProfile) => {
    setIsMatching(true)
    setMatchingStepText('Analyzing entrepreneur profile & social category allocations...')

    try {
      // Visual simulation stages for judges
      await new Promise((r) => setTimeout(r, 450))
      setMatchingStepText('Cross-referencing 13+ Central & State Ministry schemes...')
      await new Promise((r) => setTimeout(r, 450))
      setMatchingStepText('Calculating maximum capital subsidies & collateral waivers...')

      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userProfile: customUser,
          businessProfile: customBiz,
          userId: customUser.id
        })
      })

      const data = await res.json()
      if (data.success && Array.isArray(data.matches)) {
        setMatchedResults(data.matches)
        setActiveTab('matches')
        toast.success(`AI Matching Complete: Found ${data.highMatchesCount} high-priority schemes!`)
        fetchApplications()
        fetchNotifications()
      } else {
        toast.error('Could not compute matches. Please try again.')
      }
    } catch (err) {
      console.error('Match engine failed:', err)
      toast.error('Network error while matching schemes.')
    } finally {
      setIsMatching(false)
      setMatchingStepText('')
    }
  }

  // 3. LOAD DEMO PERSONA (1-Click Fast Track for Judges)
  const handleLoadDemoPersona = async (personaId) => {
    try {
      const res = await fetch('/api/auth/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personaId })
      })

      const data = await res.json()
      if (data.success) {
        setUserProfile(data.user)
        setBusinessProfile(data.business)
        setIsDemoModalOpen(false)
        toast.success(`Loaded Persona: ${data.user.name} (${data.user.socialCategory} - ${data.user.state})`)
        // Auto-run AI matching immediately for seamless demo
        await runMatchingEngine(data.user, data.business)
      }
    } catch (err) {
      console.error('Failed to load demo persona:', err)
      toast.error('Failed to load demo persona.')
    }
  }

  // 4. SAVE SCHEME TO APPLICATION TRACKER
  const handleSaveToApplications = async (schemeId, targetAmt) => {
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userProfile.id,
          schemeId,
          status: 'SAVED',
          targetAmount: targetAmt || 500000,
          notes: 'Saved for application document preparation.'
        })
      })

      const data = await res.json()
      if (data.success) {
        toast.success('Scheme saved to your Application Pipeline!')
        fetchApplications()
        fetchNotifications()
      } else {
        toast.error(data.error || 'Scheme is already saved.')
      }
    } catch (err) {
      toast.error('Failed to save scheme.')
    }
  }

  // 5. UPDATE APPLICATION STATUS & NOTES
  const handleUpdateApplicationStatus = async (appId, newStatus) => {
    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      const data = await res.json()
      if (data.success) {
        toast.success(`Application updated to "${newStatus.replace(/_/g, ' ')}"`)
        fetchApplications()
      }
    } catch (err) {
      toast.error('Failed to update application status.')
    }
  }

  // 6. TOGGLE DOCUMENT CHECKLIST
  const handleToggleDocument = async (app, docName) => {
    const currentStatus = app.documentsStatus?.[docName] || 'PENDING'
    const newDocStatus = {
      ...(app.documentsStatus || {}),
      [docName]: currentStatus === 'READY' ? 'PENDING' : 'READY'
    }

    try {
      const res = await fetch(`/api/applications/${app.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentsStatus: newDocStatus })
      })

      const data = await res.json()
      if (data.success) {
        fetchApplications()
      }
    } catch (err) {
      console.error('Failed to toggle document:', err)
    }
  }

  // 7. DELETE APPLICATION
  const handleDeleteApplication = async (appId) => {
    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Application removed from tracker')
        fetchApplications()
      }
    } catch (err) {
      toast.error('Failed to delete application')
    }
  }

  // 8. RUN INTERACTIVE ELIGIBILITY CHECKER
  const handleRunEligibilityChecker = async (schemeIdToTest) => {
    const targetId = schemeIdToTest || checkerSchemeId
    if (!targetId) {
      toast.error('Please select a scheme to check.')
      return
    }

    setIsChecking(true)
    try {
      const res = await fetch('/api/checker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schemeId: targetId,
          userProfile,
          businessProfile
        })
      })

      const data = await res.json()
      if (data.success) {
        setCheckerResult(data)
        toast.success('Eligibility pre-check generated!')
      } else {
        toast.error(data.error || 'Failed to check eligibility')
      }
    } catch (err) {
      console.error('Eligibility check error:', err)
      toast.error('Eligibility check failed.')
    } finally {
      setIsChecking(false)
    }
  }

  // 9. ADMIN: RESET / SEED DATABASE
  const handleResetDatabase = async () => {
    try {
      const res = await fetch('/api/schemes/seed', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        toast.success(`Database re-seeded with ${data.count} official government schemes!`)
        fetchSchemes()
        fetchAdminStats()
      }
    } catch (err) {
      toast.error('Failed to reset schemes database.')
    }
  }

  // 10. ADMIN: CREATE CUSTOM SCHEME
  const handleCreateScheme = async (e) => {
    e.preventDefault()
    if (!newSchemeForm.name || !newSchemeForm.department) {
      toast.error('Please fill in scheme name and department')
      return
    }

    try {
      const res = await fetch('/api/schemes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSchemeForm)
      })

      const data = await res.json()
      if (data.success) {
        toast.success('New scheme added to Saksham AI directory!')
        setIsAdminNewSchemeOpen(false)
        fetchSchemes()
        fetchAdminStats()
      }
    } catch (err) {
      toast.error('Failed to create scheme.')
    }
  }

  // Filtered schemes for directory
  const filteredSchemes = useMemo(() => {
    return schemes.filter((s) => {
      const matchesQuery =
        !searchQuery ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.shortName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory =
        filterCategory === 'ALL' ||
        (s.eligibleCategories || []).includes(filterCategory) ||
        (s.targetCategories || []).includes(filterCategory) ||
        (s.eligibleCategories || []).includes('GENERAL')

      const matchesState =
        filterState === 'ALL' ||
        (s.states || []).includes('ALL_INDIA') ||
        (s.states || []).includes(filterState)

      const matchesType = filterType === 'ALL' || s.schemeType === filterType

      return matchesQuery && matchesCategory && matchesState && matchesType
    })
  }, [schemes, searchQuery, filterCategory, filterState, filterType])

  // Derived hero-card content: live top match when available, placeholder otherwise.
  // matchedResults come from /api/match as [{ schemeId, scheme, matchScore, matchedCriteria,
  //   missingCriteria, estimatedSubsidy, explanation, isAiEnhanced }, ...] (already sorted desc).
  const topMatch = useMemo(() => {
    if (!matchedResults || !matchedResults.length) return null
    const top = matchedResults[0]
    const scheme = top.scheme || {}
    return {
      id: top.schemeId || scheme.id || 'scheme',
      shortName: scheme.shortName || scheme.name || 'Scheme',
      name: scheme.name || scheme.shortName || 'Scheme',
      score: typeof top.matchScore === 'number' ? top.matchScore : null,
      description: scheme.description || top.explanation || '',
      support: scheme.supportTypes || scheme.benefits || (Array.isArray(top.matchedCriteria) ? top.matchedCriteria : []),
      estimatedBenefit: top.estimatedSubsidy || null,
    }
  }, [matchedResults])

  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-900 flex flex-col font-sans">
      <Toaster position="top-right" richColors />

      {/* Top Tricolor Banner */}
      <div className="gov-tricolor-bar" />

      {/* Hackathon Prototype Notification Header */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-amber-500/20 text-amber-300 border-amber-400/40 text-[10px] font-semibold uppercase tracking-wider px-2 py-0">
            Hackathon Prototype
          </Badge>
          <span className="hidden sm:inline text-slate-300 font-medium">
            AI-Driven Scheme Matching for Marginalized Entrepreneurs (SC/ST, Women, OBC, PwD, Artisans)
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            AI Engine: Online
          </span>
          <span className="hidden md:inline">13+ Central & State Schemes Mapped</span>
        </div>
      </div>

      {/* Main Government Portal Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo & National Emblem Identity */}
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => setActiveTab('home')}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-900 via-blue-950 to-orange-700 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                {/* Stylized Emblem & AI Node */}
                <div className="relative flex items-center justify-center">
                  <Landmark className="w-6 h-6 text-amber-400" />
                  <Sparkles className="w-3.5 h-3.5 text-orange-400 absolute -top-1 -right-1 animate-spin" style={{ animationDuration: '6s' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black tracking-tight text-slate-900 font-serif">
                    Saksham <span className="text-orange-600">AI</span>
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-900 hidden sm:inline">
                    सक्षम AI
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium tracking-wide">
                  Empowering Marginalized Indian Entrepreneurs
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              <button
                onClick={() => setActiveTab('home')}
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === 'home'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {t.nav.home}
              </button>

              <button
                onClick={() => {
                  setWizardStep(1)
                  setActiveTab('find')
                }}
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === 'find'
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'text-slate-700 hover:text-orange-700 hover:bg-orange-50'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  {t.nav.findScheme}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('schemes')}
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === 'schemes'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {t.nav.schemes}
              </button>

              <button
                onClick={() => setActiveTab('checker')}
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === 'checker'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {t.nav.checker}
              </button>

              <button
                onClick={() => setActiveTab('applications')}
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors relative ${
                  activeTab === 'applications'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {t.nav.applications}
                  {applications.length > 0 && (
                    <span className="w-5 h-5 rounded-full bg-orange-600 text-white text-xs flex items-center justify-center font-bold">
                      {applications.length}
                    </span>
                  )}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {t.nav.dashboard}
              </button>

              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === 'admin'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {t.nav.admin}
              </button>
            </nav>

            {/* Right Controls: Language Switcher & 30s Demo Button */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Language Dropdown */}
              <div className="relative">
                <Select value={lang} onValueChange={(v) => setLang(v)}>
                  <SelectTrigger className="h-9 px-2.5 sm:px-3 text-xs font-semibold bg-slate-100 border-slate-300 w-[110px]">
                    <Globe className="w-3.5 h-3.5 mr-1 text-slate-600" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="end">
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
                    <SelectItem value="te">తెలుగు (Telugu)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 1-Click Judge Demo Mode Button */}
              <Button
                onClick={() => setIsDemoModalOpen(true)}
                className="bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 hover:from-amber-600 hover:to-red-700 text-white shadow-sm text-xs sm:text-sm font-bold px-3 sm:px-4 h-9"
              >
                <Zap className="w-4 h-4 mr-1 sm:mr-1.5 fill-amber-200" />
                <span className="hidden sm:inline">30s Demo Mode</span>
                <span className="sm:hidden">Demo</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="lg:hidden flex items-center overflow-x-auto px-4 py-2 bg-slate-100 border-t border-slate-200 gap-2 text-xs font-medium no-scrollbar">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap ${
              activeTab === 'home' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-700'
            }`}
          >
            {t.nav.home}
          </button>
          <button
            onClick={() => {
              setWizardStep(1)
              setActiveTab('find')
            }}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'find' ? 'bg-orange-600 text-white font-semibold' : 'text-orange-700'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            {t.nav.findScheme}
          </button>
          <button
            onClick={() => setActiveTab('schemes')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap ${
              activeTab === 'schemes' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-700'
            }`}
          >
            {t.nav.schemes}
          </button>
          <button
            onClick={() => setActiveTab('checker')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap ${
              activeTab === 'checker' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-700'
            }`}
          >
            {t.nav.checker}
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'applications' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-700'
            }`}
          >
            {t.nav.applications} ({applications.length})
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap ${
              activeTab === 'dashboard' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-700'
            }`}
          >
            {t.nav.dashboard}
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap ${
              activeTab === 'admin' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-700'
            }`}
          >
            {t.nav.admin}
          </button>
        </div>
      </header>

      {/* Main Content Area Routing */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* VIEW 1: HOME LANDING PAGE */}
        {activeTab === 'home' && (
          <div className="space-y-12 sm:space-y-16">
            {/* Hero Section with Official Aesthetics & High-Impact Visual */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white p-6 sm:p-10 lg:p-14 shadow-xl border border-slate-800">
              {/* Background ambient lighting */}
              <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-orange-600/20 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-emerald-600/15 blur-3xl pointer-events-none" />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
                <div className="lg:col-span-7 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-400/40 text-orange-300 text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                    <span>AI-Powered Affirmative Action & MSME Scheme Discovery</span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white font-serif">
                    Empowering <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-200">Marginalized Entrepreneurs</span> With Targeted Government Subsidies.
                  </h1>

                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
                    {t.hero.subtitle}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Button
                      size="lg"
                      onClick={() => {
                        setWizardStep(1)
                        setActiveTab('find')
                      }}
                      className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold shadow-lg shadow-orange-900/30 px-6 h-12 text-base"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      {t.hero.ctaFind}
                    </Button>

                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => setIsDemoModalOpen(true)}
                      className="border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-amber-300 hover:text-amber-200 font-semibold h-12 px-5"
                    >
                      <Zap className="w-4 h-4 mr-2 fill-amber-400 text-amber-400" />
                      {t.hero.ctaDemo}
                    </Button>

                    <Button
                      size="lg"
                      variant="ghost"
                      onClick={() => setActiveTab('schemes')}
                      className="text-slate-300 hover:text-white hover:bg-slate-800/60 font-medium h-12"
                    >
                      {t.hero.ctaExplore}
                    </Button>
                  </div>

                  {/* Active Citizen Badge */}
                  <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1 text-slate-300 font-semibold">
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      Active Profile: {userProfile.name}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-orange-300 font-medium">
                      Category: {userProfile.socialCategory}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-blue-300 font-medium">
                      {userProfile.district}, {userProfile.state}
                    </span>
                  </div>
                </div>

                {/* Hero Visual Card / 3D Innovation Showcase */}
                <div className="lg:col-span-5">
                  <div className="relative rounded-2xl bg-gradient-to-b from-slate-800/90 to-slate-900/95 p-5 border border-slate-700/80 shadow-2xl backdrop-blur-xl space-y-4">
                    {/* Visual image banner curated by vision agent */}
                    <div className="relative h-48 rounded-xl overflow-hidden border border-slate-700 shadow-inner group">
                      <img
                        src="https://images.unsplash.com/photo-1771244688590-1e481dba1b5a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNTl8MHwxfHNlYXJjaHw0fHxpbmRpYW4lMjBlbnRyZXByZW5ldXJ8ZW58MHx8fHwxNzg4MzYzOTI1fDA&ixlib=rb-4.1.0&q=85"
                        alt="Indian Entrepreneur at work"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                        <Badge className="bg-emerald-600 text-white font-bold text-xs shadow">
                          {topMatch ? `${topMatch.shortName} Ready` : 'AI-Powered Discovery'}
                        </Badge>
                        <span className="text-[11px] font-semibold text-amber-300 bg-slate-900/80 px-2 py-0.5 rounded">
                          {topMatch && topMatch.score != null
                            ? `Up to ${topMatch.score}% Match`
                            : 'Calculate Your Match'}
                        </span>
                      </div>
                    </div>

                    {/* Live AI Matching Snapshot */}
                    <div className="space-y-3 pt-1">
                      {topMatch && topMatch.score != null ? (
                        <>
                          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                            <span className="flex items-center gap-1.5">
                              <TrendingUp className="w-4 h-4 text-emerald-400" />
                              Top Matched Affirmative Scheme
                            </span>
                            <span className="text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                              {topMatch.score}% Match
                            </span>
                          </div>

                          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1.5">
                            <div className="font-bold text-white text-sm">
                              {topMatch.name}
                            </div>
                            {topMatch.estimatedBenefit != null && (
                              <div className="mt-1 text-[11px] font-semibold text-slate-400">
                                Estimated Benefit
                              </div>
                            )}
                            {topMatch.estimatedBenefit != null && (
                              <div className="mt-0.5 bg-emerald-950/80 border border-emerald-800/60 rounded-lg px-2 py-1 text-[11px] font-bold text-emerald-300">
                                {typeof topMatch.estimatedBenefit === 'string' ? topMatch.estimatedBenefit : `$${Math.round(topMatch.estimatedBenefit).toLocaleString()} (est.)`}
                              </div>
                            )}
                            {topMatch.description && (
                              <p className="text-slate-400 text-[11px] line-clamp-2">
                                {topMatch.description}
                              </p>
                            )}
                            {topMatch.support && topMatch.support.length > 0 && (
                              <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-300 font-medium">
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span>{topMatch.support.join(', ')}</span>
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
                          <div className="flex items-center gap-2 text-slate-400">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-slate-300 font-medium">No match computed yet</span>
                          </div>
                          <p className="text-slate-500 text-[11px] leading-relaxed">
                            Run the AI match above to see your top scheme, estimated subsidy, and why it fits your profile.
                          </p>
                        </div>
                      )}

                      <Button
                        onClick={() => runMatchingEngine()}
                        disabled={isMatching}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold h-10 border border-slate-600"
                      >
                        {isMatching ? (
                          <span className="flex items-center gap-2">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            Calculating Matches...
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 justify-center">
                            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                            Run AI Match for Active Profile
                          </span>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Impact & Inclusion Metric Stats Bar */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-white border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                    <Landmark className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-slate-900">{t.hero.stat1}</div>
                    <div className="text-xs text-slate-500 font-medium">{t.hero.stat1Label}</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-slate-900">{t.hero.stat2}</div>
                    <div className="text-xs text-slate-500 font-medium">{t.hero.stat2Label}</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-slate-900">{t.hero.stat3}</div>
                    <div className="text-xs text-slate-500 font-medium">{t.hero.stat3Label}</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-slate-900">Up to 45%</div>
                    <div className="text-xs text-slate-500 font-medium">Special Capital Subsidy</div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Target Beneficiary Groups - Affirmative Action Focus */}
            <section className="space-y-6">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <Badge className="bg-slate-900 text-white font-semibold text-xs">
                  Targeted Affirmative Inclusivity
                </Badge>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif">
                  Customized Subsidies for Every Marginalized Community
                </h2>
                <p className="text-slate-600 text-sm">
                  Saksham AI maps nuanced affirmative quotas, state incentives, and interest subventions specifically structured for under-represented groups.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Group 1: SC & ST Entrepreneurs */}
                <Card className="bg-gradient-to-b from-orange-50/50 to-white border-orange-200/60 shadow-sm hover:shadow-md transition-all">
                  <CardHeader className="pb-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-600 text-white flex items-center justify-center font-bold text-sm mb-2 shadow-sm">
                      SC/ST
                    </div>
                    <CardTitle className="text-base font-bold text-slate-900">
                      Scheduled Castes & Tribes
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Special 35%-45% capital subsidies, VCF-SC venture equity, NSSH GeM tenders, and Stand-Up India credit.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-xs space-y-2 text-slate-700">
                    <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Stand-Up India ₹10L - ₹1Cr</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>T-PRIDE 45% Investment Subsidy</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Group 2: Women Micro-Enterprises & SHGs */}
                <Card className="bg-gradient-to-b from-rose-50/50 to-white border-rose-200/60 shadow-sm hover:shadow-md transition-all">
                  <CardHeader className="pb-3">
                    <div className="w-10 h-10 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-sm mb-2 shadow-sm">
                      SHG
                    </div>
                    <CardTitle className="text-base font-bold text-slate-900">
                      Women Entrepreneurs & SHGs
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Concessional 4% micro-credit, Mahila Samridhi loans, PMFME seed capital, and CGTMSE guarantee fee waivers.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-xs space-y-2 text-slate-700">
                    <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Mahila Samridhi 4% Interest</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>₹40,000 Seed Capital per SHG Member</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Group 3: OBC & Micro Vendors */}
                <Card className="bg-gradient-to-b from-blue-50/50 to-white border-blue-200/60 shadow-sm hover:shadow-md transition-all">
                  <CardHeader className="pb-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm mb-2 shadow-sm">
                      OBC
                    </div>
                    <CardTitle className="text-base font-bold text-slate-900">
                      OBC & Micro Vendors
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      NBCFDC concessional term loans (3-6%), PM-SVANidhi micro-credit, and MUDRA Shishu-Kishore collateral-free loans.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-xs space-y-2 text-slate-700">
                    <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>NBCFDC 3%-6% Concessional Loans</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>PM SVANidhi 7% Interest Subsidy</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Group 4: Rural Artisans & PwD Innovators */}
                <Card className="bg-gradient-to-b from-emerald-50/50 to-white border-emerald-200/60 shadow-sm hover:shadow-md transition-all">
                  <CardHeader className="pb-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm mb-2 shadow-sm">
                      PwD
                    </div>
                    <CardTitle className="text-base font-bold text-slate-900">
                      Rural Artisans & PwD Units
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      KVIC PMEGP rural 35% subsidies, ZED certification 85% grant, and PMFME One District One Product (ODOP) support.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-xs space-y-2 text-slate-700">
                    <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>KVIC Rural 35% Capital Subsidy</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Free ZED Quality Certification</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Step-by-Step How Saksham AI Works */}
            <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-800 space-y-8">
              <div className="text-center max-w-xl mx-auto space-y-2">
                <Badge className="bg-orange-500 text-white font-semibold text-xs">
                  Intuitive 4-Step Journey
                </Badge>
                <h2 className="text-2xl sm:text-3xl font-extrabold font-serif">
                  How Saksham AI Matches & Guides You
                </h2>
                <p className="text-slate-400 text-sm">
                  From profile analysis to document readiness and application tracking.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
                {/* Step 1 */}
                <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700 space-y-3 relative">
                  <div className="w-8 h-8 rounded-full bg-orange-600 text-white font-bold text-sm flex items-center justify-center">
                    1
                  </div>
                  <h3 className="text-base font-bold text-white">Enter Profile</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Provide social category (SC/ST/OBC/Women), state, district, business type, and funding requirement.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700 space-y-3 relative">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center">
                    2
                  </div>
                  <h3 className="text-base font-bold text-white">AI Matching Engine</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Evaluates multi-dimensional rules against 13+ schemes to compute transparent 0-100% match scores.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700 space-y-3 relative">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center">
                    3
                  </div>
                  <h3 className="text-base font-bold text-white">Verify Documents</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Interactive document checklist (Aadhaar, Caste Certificate, DPR, Udyam) with pending vs ready tracker.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700 space-y-3 relative">
                  <div className="w-8 h-8 rounded-full bg-amber-600 text-white font-bold text-sm flex items-center justify-center">
                    4
                  </div>
                  <h3 className="text-base font-bold text-white">Track Application</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Monitor pipeline from Saved to Submitted and Approved, with direct official government portal access.
                  </p>
                </div>
              </div>

              <div className="text-center pt-2">
                <Button
                  size="lg"
                  onClick={() => {
                    setWizardStep(1)
                    setActiveTab('find')
                  }}
                  className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold px-8 h-12 shadow-lg"
                >
                  Start Your Scheme Match Now →
                </Button>
              </div>
            </section>

            {/* Featured Popular Schemes Spotlight */}
            <section className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 font-serif">
                    Featured Affirmative Government Schemes
                  </h2>
                  <p className="text-slate-500 text-xs sm:text-sm">
                    Verified schemes with high subsidy allocations for marginalized entrepreneurs.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab('schemes')}
                  className="text-xs font-semibold"
                >
                  View All 13+ Schemes <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {schemes.slice(0, 3).map((scheme) => (
                  <Card
                    key={scheme.id}
                    className="bg-white border-slate-200/80 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden group"
                  >
                    <div>
                      <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 to-amber-500" />
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <Badge variant="secondary" className="bg-slate-100 text-slate-800 text-[10px] font-bold">
                            {scheme.typeLabel || 'MSME Scheme'}
                          </Badge>
                          {scheme.badge && (
                            <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-[10px] font-semibold">
                              {scheme.badge}
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                          {scheme.shortName || scheme.name}
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-500 line-clamp-1">
                          {scheme.department}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="text-xs space-y-3">
                        <p className="text-slate-600 line-clamp-2 leading-relaxed">
                          {scheme.description}
                        </p>

                        <div className="p-2.5 rounded-lg bg-orange-50/70 border border-orange-200/60 text-orange-950 font-medium">
                          <span className="font-bold">Target Groups: </span>
                          {(scheme.targetCategories || scheme.eligibleCategories || []).slice(0, 4).join(', ')}
                        </div>
                      </CardContent>
                    </div>

                    <CardFooter className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedScheme(scheme)
                          setIsDetailsOpen(true)
                        }}
                        className="text-xs font-semibold text-slate-700 hover:text-slate-900"
                      >
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          handleSaveToApplications(scheme.id, scheme.maxProjectCost ? scheme.maxProjectCost * 0.5 : 500000)
                        }}
                        className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
                      >
                        <BookmarkPlus className="w-3.5 h-3.5 mr-1" />
                        Save Scheme
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* VIEW 2: FIND MY SCHEME MULTI-STEP WIZARD */}
        {activeTab === 'find' && (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Header & Persona Quick Loader Bar */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 font-serif">
                    Find Tailored Government Schemes
                  </h1>
                  <p className="text-slate-500 text-xs sm:text-sm">
                    Complete your profile in 3 simple steps to calculate your exact subsidy percentages and collateral waivers.
                  </p>
                </div>

                {/* Quick Persona Load Dropdown for Judges */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-semibold hidden sm:inline">Pre-fill Persona:</span>
                  <Select onValueChange={(val) => handleLoadDemoPersona(val)}>
                    <SelectTrigger className="w-[200px] h-9 text-xs font-semibold bg-amber-50 border-amber-300 text-amber-900">
                      <Zap className="w-3.5 h-3.5 mr-1 text-amber-600" />
                      <span>Select Demo Persona</span>
                    </SelectTrigger>
                    <SelectContent align="end">
                      {DEMO_PERSONAS.map((p) => (
                        <SelectItem key={p.id} value={p.id} className="text-xs">
                          {p.name} ({p.socialCategory} - {p.state})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Progress Stepper Bar */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
                  <span className={wizardStep >= 1 ? 'text-orange-600' : ''}>1. Personal Demographics</span>
                  <span className={wizardStep >= 2 ? 'text-orange-600' : ''}>2. Business Profile</span>
                  <span className={wizardStep >= 3 ? 'text-orange-600' : ''}>3. Support Required</span>
                  <span className={wizardStep >= 4 ? 'text-orange-600' : ''}>4. Review & AI Match</span>
                </div>
                <Progress value={(wizardStep / 4) * 100} className="h-2 bg-slate-100" />
              </div>
            </div>

            {/* STEP 1: PERSONAL DEMOGRAPHICS */}
            {wizardStep === 1 && (
              <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-orange-100 text-orange-700 text-xs flex items-center justify-center font-bold">1</span>
                    Personal & Demographic Information
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Your social category and location determine statutory affirmative allocations and state incentives.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">Full Name</Label>
                      <Input
                        value={userProfile.name}
                        onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                        placeholder="e.g. Rameshwar Rao"
                        className="h-10 text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">Email Address</Label>
                      <Input
                        type="email"
                        value={userProfile.email}
                        onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                        placeholder="e.g. entrepreneur@example.com"
                        className="h-10 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">Age</Label>
                      <Input
                        type="number"
                        value={userProfile.age}
                        onChange={(e) => setUserProfile({ ...userProfile, age: Number(e.target.value) })}
                        className="h-10 text-sm"
                        min={18}
                        max={75}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">Gender</Label>
                      <Select
                        value={userProfile.gender}
                        onValueChange={(val) => setUserProfile({ ...userProfile, gender: val })}
                      >
                        <SelectTrigger className="h-10 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other / Transgender</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-orange-700 flex items-center gap-1">
                        Social Category *
                        <Info className="w-3 h-3 text-orange-600" />
                      </Label>
                      <Select
                        value={userProfile.socialCategory}
                        onValueChange={(val) => setUserProfile({ ...userProfile, socialCategory: val })}
                      >
                        <SelectTrigger className="h-10 text-sm border-orange-300 bg-orange-50/50 font-bold text-orange-950">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SC">Scheduled Caste (SC)</SelectItem>
                          <SelectItem value="ST">Scheduled Tribe (ST)</SelectItem>
                          <SelectItem value="OBC">Other Backward Class (OBC)</SelectItem>
                          <SelectItem value="WOMEN">Women Owned (General / All)</SelectItem>
                          <SelectItem value="MINORITY">Minority Community</SelectItem>
                          <SelectItem value="PWD">Persons with Disabilities (PwD)</SelectItem>
                          <SelectItem value="EWS">Economically Weaker Section (EWS)</SelectItem>
                          <SelectItem value="GENERAL">General Category</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">State / UT</Label>
                      <Select
                        value={userProfile.state}
                        onValueChange={(val) => setUserProfile({ ...userProfile, state: val })}
                      >
                        <SelectTrigger className="h-10 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Telangana">Telangana</SelectItem>
                          <SelectItem value="Uttar Pradesh">Uttar Pradesh</SelectItem>
                          <SelectItem value="Jharkhand">Jharkhand</SelectItem>
                          <SelectItem value="Bihar">Bihar</SelectItem>
                          <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                          <SelectItem value="Karnataka">Karnataka</SelectItem>
                          <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                          <SelectItem value="Rajasthan">Rajasthan</SelectItem>
                          <SelectItem value="Madhya Pradesh">Madhya Pradesh</SelectItem>
                          <SelectItem value="Gujarat">Gujarat</SelectItem>
                          <SelectItem value="Odisha">Odisha</SelectItem>
                          <SelectItem value="West Bengal">West Bengal</SelectItem>
                          <SelectItem value="Andhra Pradesh">Andhra Pradesh</SelectItem>
                          <SelectItem value="ALL_INDIA">All India / Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">District</Label>
                      <Input
                        value={userProfile.district}
                        onChange={(e) => setUserProfile({ ...userProfile, district: e.target.value })}
                        placeholder="e.g. Warangal, Varanasi, Ranchi"
                        className="h-10 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Entrepreneur Persona Type</Label>
                    <Select
                      value={userProfile.entrepreneurType}
                      onValueChange={(val) => setUserProfile({ ...userProfile, entrepreneurType: val })}
                    >
                      <SelectTrigger className="h-10 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EXISTING">Existing Micro-Enterprise Owner</SelectItem>
                        <SelectItem value="ASPIRING">Aspiring / First-Time Entrepreneur</SelectItem>
                        <SelectItem value="SHG_MEMBER">Self Help Group (SHG) Member / Leader</SelectItem>
                        <SelectItem value="ARTISAN">Rural Craftsman / Traditional Artisan</SelectItem>
                        <SelectItem value="STREET_VENDOR">Street Vendor / Informal Micro-Trader</SelectItem>
                        <SelectItem value="RURAL_WOMEN">Rural Woman Entrepreneur</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter className="border-t border-slate-100 flex justify-between">
                  <Button variant="ghost" disabled className="text-xs">
                    Back
                  </Button>
                  <Button
                    onClick={() => setWizardStep(2)}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs"
                  >
                    Next: Business Details →
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* STEP 2: BUSINESS DETAILS */}
            {wizardStep === 2 && (
              <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">2</span>
                    Enterprise & Sector Details
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Scheme subsidy percentages vary for manufacturing vs services vs food processing.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">Enterprise / Project Name</Label>
                      <Input
                        value={businessProfile.businessName}
                        onChange={(e) => setBusinessProfile({ ...businessProfile, businessName: e.target.value })}
                        placeholder="e.g. Rao Precision Metal Works"
                        className="h-10 text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">Business Sector</Label>
                      <Select
                        value={businessProfile.businessType}
                        onValueChange={(val) => setBusinessProfile({ ...businessProfile, businessType: val })}
                      >
                        <SelectTrigger className="h-10 text-sm font-semibold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MANUFACTURING">Manufacturing / Production</SelectItem>
                          <SelectItem value="SERVICES">Services / Repair / Digital</SelectItem>
                          <SelectItem value="TRADING">Trading / Retail / Shop</SelectItem>
                          <SelectItem value="AGRO_FOOD">Agro & Food Processing (PMFME)</SelectItem>
                          <SelectItem value="HANDICRAFT_TEXTILE">Handicraft, Handloom & Textiles</SelectItem>
                          <SelectItem value="GREEN_TECH">Green Energy & Clean Tech</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">Specific Industry Activity</Label>
                      <Input
                        value={businessProfile.industry}
                        onChange={(e) => setBusinessProfile({ ...businessProfile, industry: e.target.value })}
                        placeholder="e.g. Fabricated metal products, Spice packing, Handloom weaving"
                        className="h-10 text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">Business Stage</Label>
                      <Select
                        value={businessProfile.businessStage}
                        onValueChange={(val) => setBusinessProfile({ ...businessProfile, businessStage: val })}
                      >
                        <SelectTrigger className="h-10 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="IDEATION">Ideation / New Project (Greenfield)</SelectItem>
                          <SelectItem value="EARLY_STAGE">Early Stage (0-2 Years Operational)</SelectItem>
                          <SelectItem value="GROWTH">Growth & Scaling (2-5 Years)</SelectItem>
                          <SelectItem value="EXPANSION">Modernization & Expansion (5+ Years)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">Annual Turnover (₹)</Label>
                      <Input
                        type="number"
                        value={businessProfile.annualTurnover}
                        onChange={(e) => setBusinessProfile({ ...businessProfile, annualTurnover: Number(e.target.value) })}
                        className="h-10 text-sm"
                        placeholder="e.g. 1200000"
                      />
                      <span className="text-[11px] text-slate-500 font-medium">
                        ₹{(businessProfile.annualTurnover / 100000).toFixed(1)} Lakhs
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">Employee Count</Label>
                      <Input
                        type="number"
                        value={businessProfile.employeeCount}
                        onChange={(e) => setBusinessProfile({ ...businessProfile, employeeCount: Number(e.target.value) })}
                        className="h-10 text-sm"
                        min={1}
                        max={100}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">Udyam Registration</Label>
                      <Select
                        value={businessProfile.udyamRegistered}
                        onValueChange={(val) => setBusinessProfile({ ...businessProfile, udyamRegistered: val })}
                      >
                        <SelectTrigger className="h-10 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="YES">Yes (Have Udyam Certificate)</SelectItem>
                          <SelectItem value="APPLIED">Applied / In Progress</SelectItem>
                          <SelectItem value="NO">No (Need assistance to register)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t border-slate-100 flex justify-between">
                  <Button variant="outline" onClick={() => setWizardStep(1)} className="text-xs">
                    ← Back: Personal Info
                  </Button>
                  <Button
                    onClick={() => setWizardStep(3)}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs"
                  >
                    Next: Support Needs →
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* STEP 3: SUPPORT & FUNDING REQUIREMENTS */}
            {wizardStep === 3 && (
              <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 text-xs flex items-center justify-center font-bold">3</span>
                    Support & Funding Requirements
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Select the specific interventions your business needs. Multiple selections allowed.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-xs font-semibold text-slate-700">Target Funding / Project Cost (₹)</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                      <Input
                        type="number"
                        value={businessProfile.targetAmount || 1000000}
                        onChange={(e) => setBusinessProfile({ ...businessProfile, targetAmount: Number(e.target.value) })}
                        className="h-10 text-sm font-bold"
                      />
                      <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold">
                        Estimated Project Cost: ₹{((businessProfile.targetAmount || 1000000) / 100000).toFixed(1)} Lakhs
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-700">Select Interventions Needed:</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { id: 'CAPITAL_SUBSIDY', label: 'Capital Investment Subsidy (up to 35-45%)', desc: 'Direct government grant on machinery/FCI' },
                        { id: 'FINANCE_LOAN', label: 'Term Loan / Bank Financing', desc: 'Concessional interest debt from commercial banks' },
                        { id: 'COLLATERAL_FREE', label: '100% Collateral-Free Credit', desc: 'Covered under CGTMSE or MUDRA guarantee' },
                        { id: 'WORKING_CAPITAL', label: 'Working Capital / Cash Credit', desc: 'Day-to-day raw material & operational funding' },
                        { id: 'MACHINERY', label: 'Plant & Machinery Upgradation', desc: 'Equipment purchase subsidies & leasing' },
                        { id: 'SKILL_TRAINING', label: 'EDP & Technical Skill Training', desc: 'Free capacity building & quality certifications' },
                        { id: 'MARKETING_EXHIBITION', label: 'Trade Fair Stalls & GeM Onboarding', desc: '100% booth reimbursement & market linkage' },
                        { id: 'TECH_ADOPTION', label: 'Digital MSME & ZED Certification', desc: 'Quality certification grants and software grants' }
                      ].map((item) => {
                        const isSelected = (businessProfile.supportRequired || []).includes(item.id)
                        return (
                          <div
                            key={item.id}
                            onClick={() => {
                              const current = businessProfile.supportRequired || []
                              const updated = isSelected
                                ? current.filter((x) => x !== item.id)
                                : [...current, item.id]
                              setBusinessProfile({ ...businessProfile, supportRequired: updated })
                            }}
                            className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-3 ${
                              isSelected
                                ? 'bg-orange-50/70 border-orange-500 ring-1 ring-orange-500'
                                : 'bg-slate-50/50 border-slate-200 hover:bg-slate-100/60'
                            }`}
                          >
                            <div className="mt-0.5">
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-orange-600" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-900">{item.label}</div>
                              <div className="text-[11px] text-slate-500">{item.desc}</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t border-slate-100 flex justify-between">
                  <Button variant="outline" onClick={() => setWizardStep(2)} className="text-xs">
                    ← Back: Business Details
                  </Button>
                  <Button
                    onClick={() => setWizardStep(4)}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs"
                  >
                    Next: Review & Match →
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* STEP 4: REVIEW PROFILE & TRIGGER AI MATCH */}
            {wizardStep === 4 && (
              <Card className="bg-white border-slate-200 shadow-sm space-y-4">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 text-xs flex items-center justify-center font-bold">4</span>
                    Review Profile & Run AI Matching
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Verify entered details before querying the affirmative matching engine.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Entrepreneur Summary */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                      <div className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1.5 flex items-center justify-between">
                        <span>Personal Demographics</span>
                        <Badge className="bg-orange-600 text-white font-bold">{userProfile.socialCategory}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 text-slate-600">
                        <span>Name:</span> <span className="font-semibold text-slate-900">{userProfile.name}</span>
                        <span>Age & Gender:</span> <span className="font-semibold text-slate-900">{userProfile.age} yrs, {userProfile.gender}</span>
                        <span>Location:</span> <span className="font-semibold text-slate-900">{userProfile.district}, {userProfile.state}</span>
                        <span>Persona Type:</span> <span className="font-semibold text-slate-900">{userProfile.entrepreneurType.replace(/_/g, ' ')}</span>
                      </div>
                    </div>

                    {/* Business Summary */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                      <div className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1.5 flex items-center justify-between">
                        <span>Enterprise Parameters</span>
                        <Badge variant="outline" className="text-blue-900 border-blue-300 font-semibold">{businessProfile.businessType}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 text-slate-600">
                        <span>Enterprise Name:</span> <span className="font-semibold text-slate-900">{businessProfile.businessName}</span>
                        <span>Industry:</span> <span className="font-semibold text-slate-900">{businessProfile.industry}</span>
                        <span>Stage:</span> <span className="font-semibold text-slate-900">{businessProfile.businessStage.replace(/_/g, ' ')}</span>
                        <span>Udyam Registered:</span> <span className="font-semibold text-slate-900">{businessProfile.udyamRegistered}</span>
                        <span>Target Amount:</span> <span className="font-bold text-emerald-700">₹{((businessProfile.targetAmount || 1000000) / 100000).toFixed(1)} Lakhs</span>
                      </div>
                    </div>
                  </div>

                  {/* Interventions selected */}
                  <div className="p-3 rounded-xl bg-orange-50/50 border border-orange-200/60 space-y-1.5">
                    <span className="text-xs font-bold text-orange-950">Selected Support Requirements:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(businessProfile.supportRequired || []).map((s) => (
                        <Badge key={s} variant="secondary" className="bg-white text-orange-900 border-orange-200 text-[11px]">
                          ✓ {s.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Processing animation indicator during matching */}
                  {isMatching && (
                    <div className="p-5 rounded-2xl bg-slate-900 text-white text-center space-y-3 animate-pulse">
                      <RefreshCw className="w-8 h-8 text-orange-400 animate-spin mx-auto" />
                      <div className="text-sm font-bold text-amber-300">{matchingStepText}</div>
                      <p className="text-xs text-slate-400">
                        Cross-checking Ministry of MSME, DFS, MoFPI, and State guidelines...
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t border-slate-100 flex justify-between">
                  <Button variant="outline" onClick={() => setWizardStep(3)} className="text-xs">
                    ← Back: Support Needs
                  </Button>
                  <Button
                    size="lg"
                    onClick={() => runMatchingEngine()}
                    disabled={isMatching}
                    className="bg-gradient-to-r from-orange-600 via-amber-600 to-emerald-600 hover:from-orange-700 hover:to-emerald-700 text-white font-bold text-sm px-6 shadow-md"
                  >
                    {isMatching ? 'Processing AI Match...' : 'Find My Schemes Now →'}
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        )}

        {/* VIEW 3: MATCHED SCHEMES RESULTS VIEW */}
        {activeTab === 'matches' && (
          <div className="space-y-6">
            {/* Header with matched count & summary */}
            <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-2xl p-6 shadow-lg border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-orange-500 text-white font-bold text-xs">
                    {matchedResults.length} Schemes Evaluated
                  </Badge>
                  <Badge variant="outline" className="text-emerald-300 border-emerald-400 text-xs">
                    {matchedResults.filter((m) => m.matchScore >= 80).length} High-Priority Matches (80%+)
                  </Badge>
                </div>
                <h1 className="text-2xl font-black text-white font-serif">
                  Personalized Recommendations for {userProfile.name}
                </h1>
                <p className="text-slate-300 text-xs sm:text-sm">
                  {userProfile.socialCategory} Category • {businessProfile.businessType.replace(/_/g, ' ')} • {userProfile.state}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setWizardStep(1)
                    setActiveTab('find')
                  }}
                  className="text-xs border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                >
                  <Edit3 className="w-3.5 h-3.5 mr-1" />
                  Edit Profile
                </Button>
                <Button
                  size="sm"
                  onClick={() => runMatchingEngine()}
                  disabled={isMatching}
                  className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold"
                >
                  <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isMatching ? 'animate-spin' : ''}`} />
                  Recalculate
                </Button>
              </div>
            </div>

            {/* Matched Cards List */}
            {matchedResults.length === 0 ? (
              <Card className="p-12 text-center space-y-4 bg-white border-slate-200">
                <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No Matches Generated Yet</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Run the AI matching wizard or load a sample persona to calculate matches across all schemes.
                </p>
                <Button
                  onClick={() => runMatchingEngine()}
                  className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold"
                >
                  Run Matching Engine Now
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {matchedResults.map((item) => {
                  const s = item.scheme || {}
                  const isHigh = item.matchScore >= 80
                  const isModerate = item.matchScore >= 60 && item.matchScore < 80

                  return (
                    <Card
                      key={item.schemeId}
                      className={`bg-white border transition-all hover:shadow-md ${
                        isHigh ? 'border-orange-300 ring-1 ring-orange-200/60' : 'border-slate-200'
                      }`}
                    >
                      <CardContent className="p-5 sm:p-6 space-y-4">
                        {/* Top Header: Score Badge & Titles */}
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="space-y-1 max-w-2xl">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge
                                className={`text-xs font-black px-2.5 py-0.5 ${
                                  isHigh
                                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
                                    : isModerate
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-slate-700 text-white'
                                }`}
                              >
                                {item.matchScore}% Match
                              </Badge>

                              <Badge variant="outline" className="text-slate-700 text-[11px] font-semibold bg-slate-50">
                                {s.typeLabel || 'MSME Scheme'}
                              </Badge>

                              {s.badge && (
                                <Badge className="bg-orange-100 text-orange-900 border-orange-300 text-[10px] font-bold">
                                  {s.badge}
                                </Badge>
                              )}
                            </div>

                            <h2 className="text-xl font-extrabold text-slate-900 pt-1 font-serif">
                              {s.shortName || s.name}
                            </h2>
                            <p className="text-xs text-slate-500 font-medium">{s.department}</p>
                          </div>

                          {/* Potential Benefit Tag */}
                          <div className="text-right">
                            <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                              Estimated Subsidy / Cover
                            </div>
                            <div className="text-sm font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 inline-block mt-0.5">
                              {item.estimatedSubsidy}
                            </div>
                          </div>
                        </div>

                        {/* Transparent "Why This Scheme?" Explainability Card */}
                        <div className="p-4 rounded-xl bg-slate-950 text-slate-200 space-y-2.5 border border-slate-800">
                          <div className="flex items-center gap-2 text-xs font-bold text-orange-400">
                            <Sparkles className="w-4 h-4 text-orange-400" />
                            <span>Why This Scheme? (Explainable AI Rationale)</span>
                            {item.isAiEnhanced && (
                              <Badge variant="outline" className="bg-orange-500/20 text-orange-300 border-orange-400/40 text-[9px] py-0 px-1.5 ml-auto">
                                AI Enhanced
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed font-normal">
                            {item.explanation}
                          </p>
                        </div>

                        {/* Matched Criteria Checklist */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                          <div className="space-y-1.5">
                            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>Matched Criteria ({item.matchedCriteria?.length || 0})</span>
                            </div>
                            <ul className="space-y-1">
                              {(item.matchedCriteria || []).map((reason, idx) => (
                                <li key={idx} className="text-xs text-slate-700 flex items-start gap-1.5">
                                  <span className="text-emerald-600 font-bold shrink-0">✓</span>
                                  <span>{reason}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Missing Requirements or Advisory Checkpoints */}
                          {item.missingCriteria && item.missingCriteria.length > 0 && (
                            <div className="space-y-1.5">
                              <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                                <AlertTriangle className="w-4 h-4 text-amber-600" />
                                <span>Advisory Notes / Checkpoints</span>
                              </div>
                              <ul className="space-y-1">
                                {item.missingCriteria.map((note, idx) => (
                                  <li key={idx} className="text-xs text-slate-600 flex items-start gap-1.5">
                                    <span className="text-amber-600 font-bold shrink-0">⚠</span>
                                    <span>{note}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons Footer */}
                        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedScheme(s)
                                setIsDetailsOpen(true)
                              }}
                              className="text-xs font-semibold"
                            >
                              View Full Dossier
                            </Button>

                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                setCheckerSchemeId(s.id)
                                setActiveTab('checker')
                                handleRunEligibilityChecker(s.id)
                              }}
                              className="text-xs font-semibold bg-blue-50 text-blue-900 hover:bg-blue-100"
                            >
                              Check Exact Eligibility
                            </Button>
                          </div>

                          <div className="flex items-center gap-2">
                            {s.applicationUrl && (
                              <a
                                href={s.applicationUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                              >
                                Official Portal <ExternalLink className="w-3.5 h-3.5 ml-1" />
                              </a>
                            )}

                            <Button
                              size="sm"
                              onClick={() => handleSaveToApplications(s.id, businessProfile.targetAmount)}
                              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm"
                            >
                              <BookmarkPlus className="w-3.5 h-3.5 mr-1" />
                              Save to Applications
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* VIEW 4: SCHEME DIRECTORY & SEARCH */}
        {activeTab === 'schemes' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900 font-serif">
                  All Central & State Government Schemes
                </h1>
                <p className="text-slate-500 text-xs sm:text-sm">
                  Search 13+ verified schemes supporting SC, ST, OBC, Women, and Rural Micro-Enterprises.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  setWizardStep(1)
                  setActiveTab('find')
                }}
                className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                Find My Match
              </Button>
            </div>

            {/* Search & Filter Controls */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by scheme name, ministry, keyword, subsidy..."
                  className="pl-10 h-10 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-slate-600">Category Filter</Label>
                  <Select value={filterCategory} onValueChange={(val) => setFilterCategory(val)}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Categories</SelectItem>
                      <SelectItem value="SC">Scheduled Caste (SC)</SelectItem>
                      <SelectItem value="ST">Scheduled Tribe (ST)</SelectItem>
                      <SelectItem value="OBC">Other Backward Class (OBC)</SelectItem>
                      <SelectItem value="WOMEN">Women Entrepreneurs</SelectItem>
                      <SelectItem value="PWD">Persons with Disabilities (PwD)</SelectItem>
                      <SelectItem value="GENERAL">General / Open</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-slate-600">State / Region</Label>
                  <Select value={filterState} onValueChange={(val) => setFilterState(val)}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="All India" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All States / Central</SelectItem>
                      <SelectItem value="ALL_INDIA">All India Central</SelectItem>
                      <SelectItem value="Telangana">Telangana State Special</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-slate-600">Scheme Type</Label>
                  <Select value={filterType} onValueChange={(val) => setFilterType(val)}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Scheme Types</SelectItem>
                      <SelectItem value="CAPITAL_SUBSIDY">Capital Subsidies (up to 45%)</SelectItem>
                      <SelectItem value="BANK_LOAN">Composite Bank Loans</SelectItem>
                      <SelectItem value="COLLATERAL_FREE_LOAN">100% Collateral-Free Loans</SelectItem>
                      <SelectItem value="CREDIT_GUARANTEE">Credit Guarantee Cover</SelectItem>
                      <SelectItem value="MICRO_CREDIT">Micro-Credit (PM SVANidhi)</SelectItem>
                      <SelectItem value="VENTURE_CAPITAL">Venture Capital / Equity</SelectItem>
                      <SelectItem value="MICRO_FINANCE">4% Concessional Micro-Finance</SelectItem>
                      <SelectItem value="QUALITY_TECH_SUBSIDY">ZED & Tech Subsidies</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Schemes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredSchemes.map((s) => (
                <Card
                  key={s.id}
                  className="bg-white border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-800 text-[10px] font-bold">
                          {s.typeLabel || 'MSME Scheme'}
                        </Badge>
                        {s.badge && (
                          <Badge className="bg-orange-100 text-orange-900 border-orange-300 text-[10px] font-semibold">
                            {s.badge}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-base font-bold text-slate-900 line-clamp-1">
                        {s.shortName || s.name}
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500 line-clamp-1">
                        {s.department}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="text-xs space-y-3">
                      <p className="text-slate-600 line-clamp-3 leading-relaxed">
                        {s.description}
                      </p>

                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Max Project Cost:</span>
                          <span className="font-bold text-slate-900">
                            {s.maxProjectCost ? `₹${(s.maxProjectCost / 100000).toFixed(1)} Lakhs` : 'Varies'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Beneficiary Group:</span>
                          <span className="font-bold text-orange-700 truncate max-w-[150px]">
                            {(s.targetCategories || s.eligibleCategories || []).join(', ')}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </div>

                  <CardFooter className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedScheme(s)
                        setIsDetailsOpen(true)
                      }}
                      className="text-xs font-semibold"
                    >
                      Dossier
                    </Button>

                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setCheckerSchemeId(s.id)
                          setActiveTab('checker')
                          handleRunEligibilityChecker(s.id)
                        }}
                        className="text-xs font-semibold"
                      >
                        Check
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => handleSaveToApplications(s.id, s.maxProjectCost ? s.maxProjectCost * 0.5 : 500000)}
                        className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
                      >
                        Save
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 5: INTERACTIVE ELIGIBILITY CHECKER */}
        {activeTab === 'checker' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 font-serif">
                    Interactive Eligibility Pre-Checker
                  </h1>
                  <p className="text-slate-500 text-xs sm:text-sm">
                    Instant automated assessment against official ministry eligibility criteria and required documents.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end pt-2">
                <div className="sm:col-span-8 space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Select Government Scheme to Evaluate</Label>
                  <Select value={checkerSchemeId} onValueChange={(val) => setCheckerSchemeId(val)}>
                    <SelectTrigger className="h-10 text-sm font-semibold">
                      <SelectValue placeholder="Select Scheme" />
                    </SelectTrigger>
                    <SelectContent>
                      {schemes.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.shortName || s.name} ({s.department.split(',')[0]})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="sm:col-span-4">
                  <Button
                    onClick={() => handleRunEligibilityChecker()}
                    disabled={isChecking}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-10 text-xs"
                  >
                    {isChecking ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Evaluating...
                      </span>
                    ) : (
                      'Run Pre-Check Now →'
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Pre-Check Results Display */}
            {checkerResult && (
              <Card className="bg-white border-slate-200 shadow-sm space-y-6">
                <CardHeader className="border-b border-slate-100 pb-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <Badge className="bg-slate-900 text-white text-[10px] mb-1">
                        Eligibility Pre-Check Result
                      </Badge>
                      <CardTitle className="text-xl font-bold text-slate-900 font-serif">
                        {checkerResult.scheme?.name}
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500">
                        {checkerResult.scheme?.department}
                      </CardDescription>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-semibold text-slate-500">Likelihood Assessment</div>
                      <Badge
                        className={`text-sm font-black px-3 py-1 mt-1 ${
                          checkerResult.eligibilityStatus === 'HIGHLY_ELIGIBLE'
                            ? 'bg-emerald-600 text-white'
                            : checkerResult.eligibilityStatus === 'LIKELY_ELIGIBLE'
                            ? 'bg-blue-600 text-white'
                            : 'bg-amber-600 text-white'
                        }`}
                      >
                        {checkerResult.eligibilityStatus.replace(/_/g, ' ')} ({checkerResult.matchScore}%)
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Criteria Checklist Table */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Evaluation Criteria Breakdown
                    </h3>
                    <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                      <table className="w-full text-left divide-y divide-slate-200">
                        <thead className="bg-slate-50 text-slate-700 font-semibold">
                          <tr>
                            <th className="p-3">Criterion</th>
                            <th className="p-3">Scheme Rule</th>
                            <th className="p-3">Your Profile</th>
                            <th className="p-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {(checkerResult.criteriaChecklist || []).map((c, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/60">
                              <td className="p-3 font-semibold text-slate-900">{c.criterion}</td>
                              <td className="p-3 text-slate-600">{c.required}</td>
                              <td className="p-3 font-medium text-slate-800">{c.userValue}</td>
                              <td className="p-3">
                                {c.status === 'PASS' ? (
                                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px]">
                                    ✓ PASS
                                  </Badge>
                                ) : c.status === 'WARN' ? (
                                  <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[10px]">
                                    ⚠ ADVISORY
                                  </Badge>
                                ) : (
                                  <Badge className="bg-rose-100 text-rose-800 border-rose-300 text-[10px]">
                                    ✕ FAIL
                                  </Badge>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Required Documents Checklist */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Required Documents Scrutiny
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(checkerResult.requiredDocuments || []).map((doc, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="text-slate-800 font-medium">{doc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Official Disclaimer */}
                  <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-950 text-xs space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-amber-900">
                      <Info className="w-4 h-4 text-amber-700" />
                      <span>Statutory Hackathon Prototype Disclaimer</span>
                    </div>
                    <p className="leading-relaxed text-amber-900/80">
                      {checkerResult.disclaimer}
                    </p>
                  </div>
                </CardContent>

                <CardFooter className="border-t border-slate-100 flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedScheme(checkerResult.scheme)
                      setIsDetailsOpen(true)
                    }}
                    className="text-xs"
                  >
                    View Scheme Dossier
                  </Button>

                  <Button
                    onClick={() => handleSaveToApplications(checkerResult.scheme?.id, businessProfile.targetAmount)}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
                  >
                    Save to My Applications Pipeline
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        )}

        {/* VIEW 6: APPLICATION TRACKING PIPELINE */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900 font-serif">
                  Scheme Application Pipeline Tracker
                </h1>
                <p className="text-slate-500 text-xs sm:text-sm">
                  Manage your active scheme applications from Saved to Under Review and Final Approval.
                </p>
              </div>

              <Button
                size="sm"
                onClick={() => setActiveTab('schemes')}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
              >
                <PlusCircle className="w-3.5 h-3.5 mr-1" />
                Track Another Scheme
              </Button>
            </div>

            {applications.length === 0 ? (
              <Card className="p-12 text-center space-y-4 bg-white border-slate-200">
                <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
                  <FileText className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No Applications Saved Yet</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Browse schemes or run the AI matcher and click &ldquo;Save to Applications&rdquo; to track your progress and documents.
                </p>
                <Button
                  onClick={() => setActiveTab('schemes')}
                  className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold"
                >
                  Explore Schemes
                </Button>
              </Card>
            ) : (
              <div className="space-y-5">
                {applications.map((app) => {
                  const s = app.scheme || {}
                  const docKeys = Object.keys(app.documentsStatus || {})
                  const readyCount = docKeys.filter((k) => app.documentsStatus[k] === 'READY').length
                  const docPercent = docKeys.length > 0 ? Math.round((readyCount / docKeys.length) * 100) : 0

                  const statusStages = [
                    'SAVED',
                    'ELIGIBILITY_CHECKED',
                    'DOCUMENTS_PENDING',
                    'READY_TO_APPLY',
                    'SUBMITTED',
                    'UNDER_REVIEW',
                    'APPROVED'
                  ]
                  const currentIdx = statusStages.indexOf(app.status)

                  return (
                    <Card key={app.id} className="bg-white border-slate-200 shadow-sm overflow-hidden">
                      <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-orange-500 to-emerald-500" />
                      <CardHeader className="pb-3">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-slate-700 font-mono text-[10px]">
                                Ref: {app.trackingNumber || 'SAKSHAM-001'}
                              </Badge>
                              <Badge className="bg-slate-900 text-white text-[10px] font-bold">
                                {app.status.replace(/_/g, ' ')}
                              </Badge>
                            </div>
                            <CardTitle className="text-lg font-bold text-slate-900">
                              {s.shortName || s.name || 'Government Scheme'}
                            </CardTitle>
                            <CardDescription className="text-xs text-slate-500">
                              {s.department}
                            </CardDescription>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Status Changer Dropdown */}
                            <Select
                              value={app.status}
                              onValueChange={(val) => handleUpdateApplicationStatus(app.id, val)}
                            >
                              <SelectTrigger className="h-8 text-xs font-semibold w-[180px] bg-slate-50">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent align="end">
                                <SelectItem value="SAVED">1. Saved</SelectItem>
                                <SelectItem value="ELIGIBILITY_CHECKED">2. Eligibility Checked</SelectItem>
                                <SelectItem value="DOCUMENTS_PENDING">3. Documents Pending</SelectItem>
                                <SelectItem value="READY_TO_APPLY">4. Ready to Apply</SelectItem>
                                <SelectItem value="SUBMITTED">5. Submitted to Bank/Portal</SelectItem>
                                <SelectItem value="UNDER_REVIEW">6. Under Review</SelectItem>
                                <SelectItem value="APPROVED">7. Approved / Sanctioned</SelectItem>
                                <SelectItem value="REJECTED">Rejected / Requires Resubmission</SelectItem>
                              </SelectContent>
                            </Select>

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteApplication(app.id)}
                              className="text-slate-400 hover:text-rose-600 h-8 w-8 p-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4 text-xs">
                        {/* Interactive Status Pipeline Stepper */}
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-2 overflow-x-auto gap-2">
                            {statusStages.map((st, i) => (
                              <span
                                key={st}
                                className={`whitespace-nowrap px-2 py-0.5 rounded ${
                                  i === currentIdx
                                    ? 'bg-orange-600 text-white'
                                    : i < currentIdx
                                    ? 'text-emerald-700 bg-emerald-100 font-semibold'
                                    : 'text-slate-400'
                                }`}
                              >
                                {i + 1}. {st.replace(/_/g, ' ')}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Document Readiness Bar & Checklist */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                            <span className="flex items-center gap-1.5">
                              <FileText className="w-4 h-4 text-blue-600" />
                              Document Readiness ({readyCount} of {docKeys.length} Ready)
                            </span>
                            <span className="text-blue-700 font-black">{docPercent}%</span>
                          </div>
                          <Progress value={docPercent} className="h-2 bg-slate-100" />

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            {docKeys.map((docName) => {
                              const isReady = app.documentsStatus[docName] === 'READY'
                              return (
                                <div
                                  key={docName}
                                  onClick={() => handleToggleDocument(app, docName)}
                                  className={`p-2 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition-all ${
                                    isReady
                                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900 font-semibold'
                                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    {isReady ? (
                                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    ) : (
                                      <Square className="w-4 h-4 text-slate-400 shrink-0" />
                                    )}
                                    <span className="truncate">{docName}</span>
                                  </div>
                                  <Badge variant="outline" className="text-[9px] shrink-0 ml-2">
                                    {isReady ? 'READY' : 'PENDING'}
                                  </Badge>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* Application Notes */}
                        {app.notes && (
                          <div className="p-2.5 rounded-lg bg-slate-100/80 text-slate-700 text-xs">
                            <span className="font-bold">Notes: </span> {app.notes}
                          </div>
                        )}
                      </CardContent>

                      <CardFooter className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>Updated: {new Date(app.lastUpdated).toLocaleDateString()}</span>
                        {s.applicationUrl && (
                          <a
                            href={s.applicationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-700 font-semibold hover:underline"
                          >
                            Go to Official Government Portal <ExternalLink className="w-3.5 h-3.5 ml-1" />
                          </a>
                        )}
                      </CardFooter>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* VIEW 7: USER DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Citizen Welcome Banner */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white rounded-2xl p-6 shadow-lg border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-orange-500 text-white font-bold text-xs">
                    {userProfile.socialCategory} Entrepreneur
                  </Badge>
                  <span className="text-xs text-slate-400">
                    {userProfile.district}, {userProfile.state}
                  </span>
                </div>
                <h1 className="text-2xl font-black text-white font-serif">
                  Welcome, {userProfile.name}
                </h1>
                <p className="text-slate-300 text-xs sm:text-sm">
                  {businessProfile.businessName} • {businessProfile.businessType.replace(/_/g, ' ')}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => runMatchingEngine()}
                  className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  Recalculate AI Match
                </Button>
              </div>
            </div>

            {/* Dashboard Metric KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-white border-slate-200">
                <CardContent className="p-5 space-y-1">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Matched Schemes
                  </div>
                  <div className="text-3xl font-black text-slate-900">
                    {matchedResults.length || schemes.length}
                  </div>
                  <div className="text-xs text-emerald-600 font-medium">100% Eligible Catalog</div>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200">
                <CardContent className="p-5 space-y-1">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    High Priority (80%+)
                  </div>
                  <div className="text-3xl font-black text-orange-600">
                    {matchedResults.filter((m) => m.matchScore >= 80).length || 3}
                  </div>
                  <div className="text-xs text-orange-700 font-medium">Immediate Application</div>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200">
                <CardContent className="p-5 space-y-1">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Active Applications
                  </div>
                  <div className="text-3xl font-black text-blue-700">
                    {applications.length}
                  </div>
                  <div className="text-xs text-blue-600 font-medium">In Document Pipeline</div>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200">
                <CardContent className="p-5 space-y-1">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Potential Subsidy
                  </div>
                  <div className="text-3xl font-black text-emerald-700">
                    35% - 45%
                  </div>
                  <div className="text-xs text-emerald-600 font-medium">Special Affirmative Rate</div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Action Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Active Applications Summary */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 font-serif">
                    My Active Scheme Applications
                  </h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setActiveTab('applications')}
                    className="text-xs font-semibold text-slate-700"
                  >
                    View Pipeline →
                  </Button>
                </div>

                {applications.length === 0 ? (
                  <Card className="p-6 text-center text-xs text-slate-500 bg-white border-slate-200">
                    No active applications. Save schemes from results to begin tracking.
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {applications.slice(0, 3).map((app) => (
                      <Card key={app.id} className="bg-white border-slate-200 p-4 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-bold text-slate-900 text-sm">
                              {app.scheme?.shortName || app.scheme?.name || 'Scheme'}
                            </div>
                            <div className="text-xs text-slate-500">{app.scheme?.department}</div>
                          </div>
                          <Badge className="bg-slate-900 text-white text-[10px]">
                            {app.status.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Notifications & Deadlines */}
              <div className="lg:col-span-5 space-y-4">
                <h3 className="text-base font-bold text-slate-900 font-serif flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-orange-600" />
                  Notifications & Scheme Updates
                </h3>

                <div className="space-y-2.5">
                  {notifications.slice(0, 4).map((n) => (
                    <div key={n.id} className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1 shadow-sm">
                      <div className="font-bold text-slate-900 flex justify-between">
                        <span>{n.title}</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 8: ADMIN PANEL */}
        {activeTab === 'admin' && (
          <div className="space-y-6">
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-lg border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div>
                <Badge className="bg-rose-600 text-white text-[10px] font-bold mb-1">
                  Administrator Portal
                </Badge>
                <h1 className="text-2xl font-black text-white font-serif">
                  Saksham AI Governance & Analytics
                </h1>
                <p className="text-slate-400 text-xs sm:text-sm">
                  Manage official government schemes, affirmative category allocations, and monitor platform reach.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleResetDatabase()}
                  className="border-slate-700 bg-slate-800 text-amber-300 hover:bg-slate-700 text-xs font-semibold"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1" />
                  Reset / Re-Seed Database (13 Schemes)
                </Button>

                <Button
                  size="sm"
                  onClick={() => setIsAdminNewSchemeOpen(true)}
                  className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold"
                >
                  <PlusCircle className="w-3.5 h-3.5 mr-1" />
                  Add New Scheme
                </Button>
              </div>
            </div>

            {/* Admin Metrics Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-white border-slate-200">
                <CardContent className="p-5 space-y-1">
                  <div className="text-xs font-semibold text-slate-500">Total Schemes</div>
                  <div className="text-2xl font-black text-slate-900">{adminStats?.totalSchemes || schemes.length}</div>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200">
                <CardContent className="p-5 space-y-1">
                  <div className="text-xs font-semibold text-slate-500">Active Schemes</div>
                  <div className="text-2xl font-black text-emerald-700">{adminStats?.activeSchemes || schemes.length}</div>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200">
                <CardContent className="p-5 space-y-1">
                  <div className="text-xs font-semibold text-slate-500">Total Applications</div>
                  <div className="text-2xl font-black text-blue-700">{adminStats?.totalApplications || applications.length}</div>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200">
                <CardContent className="p-5 space-y-1">
                  <div className="text-xs font-semibold text-slate-500">Matching Queries</div>
                  <div className="text-2xl font-black text-orange-600">{adminStats?.totalMatches || 24}</div>
                </CardContent>
              </Card>
            </div>

            {/* Scheme Catalog Admin Table */}
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-base font-bold text-slate-900">
                  Government Schemes Registry ({schemes.length})
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Direct CRUD control over cataloged central and state schemes.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left divide-y divide-slate-200">
                    <thead className="bg-slate-50 text-slate-700 font-semibold">
                      <tr>
                        <th className="p-3.5">Scheme Name</th>
                        <th className="p-3.5">Department</th>
                        <th className="p-3.5">Type</th>
                        <th className="p-3.5">Special Subsidy</th>
                        <th className="p-3.5">Target Group</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {schemes.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/60">
                          <td className="p-3.5 font-bold text-slate-900">{s.shortName || s.name}</td>
                          <td className="p-3.5 text-slate-600 max-w-[200px] truncate">{s.department}</td>
                          <td className="p-3.5">
                            <Badge variant="outline" className="text-[10px]">
                              {s.typeLabel || s.schemeType}
                            </Badge>
                          </td>
                          <td className="p-3.5 font-bold text-emerald-700">
                            {s.subsidyPercentSpecial ? `${s.subsidyPercentSpecial}%` : 'N/A'}
                          </td>
                          <td className="p-3.5 text-slate-700">
                            {(s.targetCategories || []).join(', ')}
                          </td>
                          <td className="p-3.5 text-right space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedScheme(s)
                                setIsDetailsOpen(true)
                              }}
                              className="text-xs h-7 px-2"
                            >
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* SCHEME FULL DETAILS MODAL */}
      {selectedScheme && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-slate-900 text-white text-[10px]">
                  {selectedScheme.typeLabel || selectedScheme.schemeType}
                </Badge>
                {selectedScheme.badge && (
                  <Badge className="bg-orange-100 text-orange-900 border-orange-300 text-[10px] font-bold">
                    {selectedScheme.badge}
                  </Badge>
                )}
              </div>
              <DialogTitle className="text-xl font-bold text-slate-900 font-serif">
                {selectedScheme.name}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                {selectedScheme.department} {selectedScheme.nodalAgency && `• ${selectedScheme.nodalAgency}`}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 text-xs text-slate-700 py-2">
              {/* Overview */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900 text-sm">Scheme Overview</h4>
                <p className="leading-relaxed text-slate-600">{selectedScheme.description}</p>
              </div>

              {/* Financial Benefits Matrix */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">Key Benefits & Subsidies</h4>
                <ul className="space-y-1.5 bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200/80">
                  {(selectedScheme.benefits || []).map((b, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-emerald-950 font-medium">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Eligibility Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-slate-500 font-medium">Target Affirmative Groups: </span>
                  <span className="font-bold text-orange-700">
                    {(selectedScheme.targetCategories || []).join(', ')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Applicable States: </span>
                  <span className="font-bold text-slate-900">
                    {(selectedScheme.states || []).join(', ')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Eligible Sectors: </span>
                  <span className="font-bold text-slate-900">
                    {(selectedScheme.eligibleBusinessTypes || []).map((b) => b.replace(/_/g, ' ')).join(', ')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Age Limit: </span>
                  <span className="font-bold text-slate-900">
                    {selectedScheme.minAge} to {selectedScheme.maxAge} years
                  </span>
                </div>
              </div>

              {/* Required Documents */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">Required Document Checklist</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(selectedScheme.documents || []).map((doc, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-slate-100/70 border border-slate-200 text-slate-800 flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{doc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Application Roadmap */}
              {selectedScheme.applicationMode && (
                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-950 space-y-1">
                  <span className="font-bold">Official Application Roadmap: </span>
                  <p className="text-[11px] leading-relaxed">{selectedScheme.applicationMode}</p>
                </div>
              )}
            </div>

            <DialogFooter className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
              {selectedScheme.officialWebsite && (
                <a
                  href={selectedScheme.officialWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
                >
                  Official Portal ↗
                </a>
              )}

              <Button
                onClick={() => {
                  handleSaveToApplications(selectedScheme.id, selectedScheme.maxProjectCost ? selectedScheme.maxProjectCost * 0.5 : 500000)
                  setIsDetailsOpen(false)
                }}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
              >
                <BookmarkPlus className="w-3.5 h-3.5 mr-1" />
                Save to My Applications
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* 30-SECOND DEMO MODE PERSONA MODAL */}
      <Dialog open={isDemoModalOpen} onOpenChange={setIsDemoModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="inline-flex items-center gap-1.5 text-amber-600 text-xs font-bold mb-1">
              <Zap className="w-4 h-4 fill-amber-500" />
              <span>Hackathon Judge Fast-Track</span>
            </div>
            <DialogTitle className="text-xl font-bold text-slate-900 font-serif">
              Select an Entrepreneur Persona to Test
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Select any profile below to immediately simulate AI matching, calculated subsidies, and application pipelines within seconds.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
            {DEMO_PERSONAS.map((p) => (
              <Card
                key={p.id}
                onClick={() => handleLoadDemoPersona(p.id)}
                className={
                  `bg-white border-slate-200 cursor-pointer transition-all p-4 space-y-2.5 group relative ${
                    selectedDemoPersonaId === p.id
                      ? 'border-orange-500 ring-2 ring-orange-500/40 shadow-sm'
                      : 'hover:border-orange-500 hover:ring-1 hover:ring-orange-500'
                  }`
                }
              >
                {selectedDemoPersonaId === p.id && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                    <Check className="w-3 h-3" />
                  </div>
                )}
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className={`font-bold text-sm transition-colors ${
                      selectedDemoPersonaId === p.id ? 'text-orange-700' : 'text-slate-900 group-hover:text-orange-600'
                    }`}>
                      {p.name}
                    </h4>
                    <div className="text-xs text-slate-500">{p.district}, {p.state}</div>
                  </div>
                  <Badge className="bg-orange-600 text-white font-bold text-[10px]">
                    {p.socialCategory}
                  </Badge>
                </div>

                <div className="p-2 rounded bg-slate-50 text-[11px] text-slate-700">
                  <span className="font-bold text-slate-900">{p.businessName}</span>
                  <div>{p.industry} • {p.businessStage.replace(/_/g, ' ')}</div>
                </div>

                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {p.story}
                </p>

                <div className="text-[11px] font-bold text-emerald-700 flex items-center justify-between pt-1 border-t border-slate-100">
                  <span>Match Target: ₹{(p.targetAmount / 100000).toFixed(1)}L</span>
                  <span className="group-hover:translate-x-1 transition-transform">Run Match →</span>
                </div>
              </Card>
            ))}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDemoModalOpen(false)} className="text-xs">
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ADMIN ADD SCHEME MODAL */}
      <Dialog open={isAdminNewSchemeOpen} onOpenChange={setIsAdminNewSchemeOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 font-serif">
              Add New Official Scheme
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Register a new Central or State scheme with affirmative quota allocations.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateScheme} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Scheme Full Name *</Label>
                <Input
                  value={newSchemeForm.name}
                  onChange={(e) => setNewSchemeForm({ ...newSchemeForm, name: e.target.value })}
                  placeholder="e.g. National SC-ST Hub"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Short Name / Code</Label>
                <Input
                  value={newSchemeForm.shortName}
                  onChange={(e) => setNewSchemeForm({ ...newSchemeForm, shortName: e.target.value })}
                  placeholder="e.g. NSSH"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Ministry / Department *</Label>
              <Input
                value={newSchemeForm.department}
                onChange={(e) => setNewSchemeForm({ ...newSchemeForm, department: e.target.value })}
                placeholder="e.g. Ministry of MSME"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Description & Objectives</Label>
              <Textarea
                value={newSchemeForm.description}
                onChange={(e) => setNewSchemeForm({ ...newSchemeForm, description: e.target.value })}
                placeholder="Details of subsidy percentage, eligibility criteria..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Scheme Type</Label>
                <Select
                  value={newSchemeForm.schemeType}
                  onValueChange={(val) => setNewSchemeForm({ ...newSchemeForm, schemeType: val })}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CAPITAL_SUBSIDY">Capital Subsidy</SelectItem>
                    <SelectItem value="BANK_LOAN">Bank Loan</SelectItem>
                    <SelectItem value="COLLATERAL_FREE_LOAN">Collateral Free Loan</SelectItem>
                    <SelectItem value="MICRO_CREDIT">Micro Credit</SelectItem>
                    <SelectItem value="QUALITY_TECH_SUBSIDY">Tech Subsidy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Special Subsidy (%)</Label>
                <Input
                  type="number"
                  value={newSchemeForm.subsidyPercentSpecial}
                  onChange={(e) => setNewSchemeForm({ ...newSchemeForm, subsidyPercentSpecial: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Max Project Cost (₹)</Label>
                <Input
                  type="number"
                  value={newSchemeForm.maxProjectCost}
                  onChange={(e) => setNewSchemeForm({ ...newSchemeForm, maxProjectCost: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Application Portal URL</Label>
              <Input
                value={newSchemeForm.applicationUrl}
                onChange={(e) => setNewSchemeForm({ ...newSchemeForm, applicationUrl: e.target.value })}
                placeholder="https://msme.gov.in"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsAdminNewSchemeOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-slate-900 text-white font-bold">
                Add Scheme
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Professional Government Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs mt-auto border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-amber-400" />
                <span className="text-lg font-black text-white tracking-tight font-serif">
                  Saksham <span className="text-orange-500">AI</span>
                </span>
                <span className="text-[10px] font-semibold bg-blue-900/60 text-blue-200 px-2 py-0.5 rounded">
                  सक्षम AI
                </span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-md font-normal">
                AI-Driven affirmative government scheme matching engine tailored for Scheduled Castes (SC), Scheduled Tribes (ST), OBCs, Women Entrepreneurs, Rural Artisans, and Persons with Disabilities (PwD).
              </p>
              <div className="pt-1 text-[11px] text-amber-300/80 font-medium">
                Built for the Inclusive Enterprise & Citizen Tech Innovation Hackathon.
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">Official Portals</h4>
              <ul className="space-y-1.5 text-slate-400 text-xs">
                <li><a href="https://msme.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Ministry of MSME ↗</a></li>
                <li><a href="https://standupmitra.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Stand-Up Mitra ↗</a></li>
                <li><a href="https://udyamregistration.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Udyam Registration ↗</a></li>
                <li><a href="https://myscheme.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">myScheme Portal ↗</a></li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">Transparency & Safety</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                This hackathon prototype provides deterministic matching and explainable AI insights. Final statutory eligibility is vetted by respective banks and ministries.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
            <div>© {new Date().getFullYear()} Saksham AI • Inclusive Citizen Tech Prototype</div>
            <div className="flex items-center gap-3">
              <span className="text-slate-400 font-medium">Languages: English • हिन्दी • తెలుగు</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

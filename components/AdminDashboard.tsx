'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAppContext } from '@/context/AppContext'
import { Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'

interface SummaryData {
  total: number
  lastMonth: number
  lastYear: number
  byRefCode: { ref_code: string; count: number }[]
}

interface Referral {
  id: string
  referrer: { telegram_username: string }
  referee: { telegram_username: string }
  ref_code: string
  referral_date: string
}

export default function AdminDashboard() {
  const { user, t } = useAppContext()
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [summary, setSummary] = useState<SummaryData>({
    total: 0,
    lastMonth: 0,
    lastYear: 0,
    byRefCode: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        if (user?.role === 1) {
          const { data: referralsData, error: fetchError } = await supabase
            .from('referrals')
            .select(`
              *,
              referrer:users!referrals_user_id_fkey(telegram_id, telegram_username),
              referee:users!referrals_referred_user_id_fkey(telegram_id, telegram_username)
            `)
            .order('referral_date', { ascending: false })

          if (fetchError) throw fetchError

          setReferrals(referralsData || [])

          const total = referralsData.length
          const now = new Date()
          const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
          const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())

          const lastMonth = referralsData.filter(referral => new Date(referral.referral_date) > oneMonthAgo).length
          const lastYear = referralsData.filter(referral => new Date(referral.referral_date) > oneYearAgo).length

          const byRefCode = referralsData.reduce((acc: Record<string, number>, referral: Referral) => {
            if (!referral.ref_code) return acc
            acc[referral.ref_code] = (acc[referral.ref_code] || 0) + 1
            return acc
          }, {})

          const byRefCodeArray = Object.entries(byRefCode).map(([ref_code, count]) => ({
            ref_code,
            count
          }))

          setSummary({ total, lastMonth, lastYear, byRefCode: byRefCodeArray })
          setLoading(false)
        }
      } catch (error: any) {
        setError(error.message)
        setLoading(false)
      }
    }
    fetchReferrals()
  }, [user])

  const filteredReferrals = referrals.filter(referral =>
    referral.referrer.telegram_username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    referral.referee.telegram_username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    referral.ref_code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded" role="alert">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2 mb-6">
        <Shield className="w-8 h-8 text-primary" />
        {t('adminDashboard')}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalReferrals')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-20" /> : summary.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('referralsLastMonth')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-20" /> : summary.lastMonth}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('referralsLastYear')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-20" /> : summary.lastYear}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">{t('referralsList')}</h2>
          <div className="flex items-center gap-2">
            <Input
              type="text"
              placeholder={t('search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Button onClick={() => setSearchTerm('')}>{t('clear')}</Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('referrer')}</TableHead>
              <TableHead>{t('referee')}</TableHead>
              <TableHead>{t('refCode')}</TableHead>
              <TableHead>{t('date')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <Skeleton className="h-8 w-full" />
                </TableCell>
              </TableRow>
            ) : (
              filteredReferrals.map((referral) => (
                <TableRow key={referral.id}>
                  <TableCell>{referral.referrer.telegram_username}</TableCell>
                  <TableCell>{referral.referee.telegram_username}</TableCell>
                  <TableCell>{referral.ref_code}</TableCell>
                  <TableCell>{new Date(referral.referral_date).toLocaleDateString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-8 space-y-4">
        <h2 className="text-2xl font-semibold">{t('referralsByCode')}</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('refCode')}</TableHead>
              <TableHead>{t('referrals')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={2}>
                  <Skeleton className="h-8 w-full" />
                </TableCell>
              </TableRow>
            ) : (
              summary.byRefCode.map((refCode) => (
                <TableRow key={refCode.ref_code}>
                  <TableCell>{refCode.ref_code}</TableCell>
                  <TableCell>{refCode.count}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

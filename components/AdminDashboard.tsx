'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAppContext } from '@/context/AppContext'
import { Shield, Users, CreditCard, Coins } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/hooks/use-toast'

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

interface UserData {
  id: number
  telegram_id: number
  telegram_username: string
  coins: number
  rp: number
  X: number
  ref_code: string
  rank: string
  social_credit: number
  role: number
}

export default function AdminDashboard() {
  const { user, t } = useAppContext()
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [users, setUsers] = useState<UserData[]>([])
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
    const fetchData = async () => {
      try {
        if (user?.role === 1) {
          const [referralsData, usersData] = await Promise.all([
            supabase
              .from('referrals')
              .select(`
                *,
                referrer:users!referrals_user_id_fkey(telegram_id, telegram_username),
                referee:users!referrals_referred_user_id_fkey(telegram_id, telegram_username)
              `)
              .order('referral_date', { ascending: false }),
            supabase
              .from('users')
              .select('id, telegram_id, telegram_username, coins, rp, X, ref_code, rank, social_credit, role')
              .order('coins', { ascending: false })
          ])

          if (referralsData.error) throw referralsData.error
          if (usersData.error) throw usersData.error

          setReferrals(referralsData.data || [])
          setUsers(usersData.data || [])

          const total = referralsData.data.length
          const now = new Date()
          const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
          const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())

          const lastMonth = referralsData.data.filter(referral => new Date(referral.referral_date) > oneMonthAgo).length
          const lastYear = referralsData.data.filter(referral => new Date(referral.referral_date) > oneYearAgo).length

          const byRefCode = referralsData.data.reduce((acc: Record<string, number>, referral: Referral) => {
            if (!referral.ref_code) return acc
            acc[referral.ref_code] = (acc[referral.ref_code] || 0) + 1
            return acc
          }, {})

          const byRefCodeArray = Object.entries(byRefCode).map(([ref_code, count]) => ({
            ref_code,
            count: count as number
          }))

          setSummary({ total, lastMonth, lastYear, byRefCode: byRefCodeArray })
          setLoading(false)
        }
      } catch (error: any) {
        setError(error.message)
        setLoading(false)
      }
    }
    fetchData()
  }, [user])

  const filteredReferrals = referrals.filter(referral =>
    referral.referrer.telegram_username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    referral.referee.telegram_username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    referral.ref_code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredUsers = users.filter(user =>
    user.telegram_username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.ref_code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const promoteToAdmin = async (userId: number) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ role: 1 })
        .eq('id', userId)
        .select()

      if (error) throw error

      setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, role: 1 } : u))
      toast({
        title: "User promoted",
        description: "The user has been successfully promoted to admin status.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to promote user: ${error.message}`,
        variant: "destructive",
      })
    }
  }

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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalReferrals')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-20" /> : summary.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('referralsLastMonth')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-20" /> : summary.lastMonth}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('referralsLastYear')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-20" /> : summary.lastYear}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalUsers')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-20" /> : users.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">{t('adminData')}</h2>
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

        <Tabs defaultValue="referrals">
          <TabsList>
            <TabsTrigger value="referrals">{t('referrals')}</TabsTrigger>
            <TabsTrigger value="users">{t('users')}</TabsTrigger>
          </TabsList>
          <TabsContent value="referrals">
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
          </TabsContent>
          <TabsContent value="users">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('username')}</TableHead>
                  <TableHead>{t('coins')}</TableHead>
                  <TableHead>{t('rp')}</TableHead>
                  <TableHead>{t('X')}</TableHead>
                  <TableHead>{t('refCode')}</TableHead>
                  <TableHead>{t('rank')}</TableHead>
                  <TableHead>{t('socialCredit')}</TableHead>
                  <TableHead>{t('role')}</TableHead>
                  <TableHead>{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.telegram_username}</TableCell>
                      <TableCell>{user.coins}</TableCell>
                      <TableCell>{user.rp}</TableCell>
                      <TableCell>{user.X}</TableCell>
                      <TableCell>{user.ref_code}</TableCell>
                      <TableCell>{user.rank}</TableCell>
                      <TableCell>{user.social_credit}</TableCell>
                      <TableCell>{user.role === 1 ? 'Admin' : 'User'}</TableCell>
                      <TableCell>
                        {user.role !== 1 && (
                          <Button onClick={() => promoteToAdmin(user.id)} size="sm">
                            {t('promoteToAdmin')}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
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

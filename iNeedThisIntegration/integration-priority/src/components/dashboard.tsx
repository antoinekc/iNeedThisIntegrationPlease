'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Trophy, TrendingUp, Users, Euro, Building2 } from 'lucide-react'
import Image from 'next/image'

interface IntegrationPriority {
  name: string
  status: string
  description: string
  development_start: string | null
  estimated_completion: string | null
  total_mrr_potential: number
  mrr_at_risk: number
  mrr_prospects: number
  vote_count: number
  current_clients_count: number
  prospects_count: number
  avg_mrr: number
}

interface Vote {
  id: number
  restaurant_name: string
  mrr_potential: number
  integration_name: string
  sales_person: string
  client_type: string
  notes: string | null
  created_at: string
}

// Function to get logo path for integration
const getIntegrationLogo = (integrationName: string) => {
  const logoMap: { [key: string]: string } = {
    'Overfull': '/logos/overfull.png',
    'Zucchetti PMS': '/logos/zucchetti.png',
    'Cegid': '/logos/cegid.png',
    'Komia': '/logos/komia.png',
    'Deliveroo': '/logos/deliveroo.png',
    'Sage': '/logos/sage.png',
    'Click & Collect': '/logos/clickcollect.png',
    'Borne de commande': '/logos/borne.png',
    'Mailchimp': '/logos/mailchimp.png'
  }
  return logoMap[integrationName] || null
}

export function Dashboard() {
  const [priorities, setPriorities] = useState<IntegrationPriority[]>([])
  const [votes, setVotes] = useState<Vote[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = async () => {
    try {
      // Check if Supabase is properly configured
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('example')) {
        console.warn('Supabase not configured - using demo mode')
        // Set demo data
        setPriorities([])
        setVotes([])
        setIsLoading(false)
        return
      }

      const [prioritiesResult, votesResult] = await Promise.all([
        supabase.from('integration_priorities').select('*'),
        supabase.from('votes').select('*').order('created_at', { ascending: false })
      ])

      if (prioritiesResult.error) {
        console.error('Priorities error:', prioritiesResult.error)
        setPriorities([])
      } else {
        setPriorities(prioritiesResult.data || [])
      }

      if (votesResult.error) {
        console.error('Votes error:', votesResult.error)
        setVotes([])
      } else {
        setVotes(votesResult.data || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      // Set empty data on error
      setPriorities([])
      setVotes([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const totalMRRPotential = priorities.reduce((sum, p) => sum + (p.total_mrr_potential || 0), 0)
  const totalMRRAtRisk = priorities.reduce((sum, p) => sum + (p.mrr_at_risk || 0), 0)
  const totalMRRProspects = priorities.reduce((sum, p) => sum + (p.mrr_prospects || 0), 0)
  const totalVotes = priorities.reduce((sum, p) => sum + (p.vote_count || 0), 0)
  const totalCurrentClients = priorities.reduce((sum, p) => sum + (p.current_clients_count || 0), 0)
  const totalProspects = priorities.reduce((sum, p) => sum + (p.prospects_count || 0), 0)
  const topIntegration = priorities[0]
  
  // Check if we're in demo mode
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const isDemoMode = !supabaseUrl || supabaseUrl.includes('example')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'in_development': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Terminé'
      case 'in_development': return 'En développement'
      default: return 'Demandé'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
      <div className="max-w-full mx-auto space-y-6">
        <div className="text-center space-y-2">
        </div>

        {isDemoMode && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Configuration Supabase requise
                </h3>
                <p className="mt-1 text-sm text-yellow-700">
                  Pour utiliser l'application, configurez vos variables d'environnement Supabase dans le fichier .env.local
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="flex items-center p-6">
              <Euro className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-700">MRR à Risque</p>
                <p className="text-2xl font-bold text-red-700">{totalMRRAtRisk.toLocaleString()}€</p>
                <p className="text-xs text-gray-600">{totalCurrentClients} clients actuels</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-6">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-700">MRR Potentiel</p>
                <p className="text-2xl font-bold text-green-700">{totalMRRProspects.toLocaleString()}€</p>
                <p className="text-xs text-gray-600">{totalProspects} prospects</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-6">
              <Building2 className="h-8 w-8 text-gray-600" />
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-700">Impact Total</p>
                <p className="text-2xl font-bold text-gray-800">{totalMRRPotential.toLocaleString()}€</p>
                <p className="text-xs text-gray-600">{totalVotes} demandes totales</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-6">
              <Trophy className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-700">Priorité #1</p>
                <p className="text-lg font-bold text-gray-900 truncate">{topIntegration?.name || 'N/A'}</p>
                {topIntegration && (
                  <p className="text-xs text-gray-600">{(topIntegration.total_mrr_potential || 0).toLocaleString()}€</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="priorities" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="priorities">Priorités</TabsTrigger>
            <TabsTrigger value="votes">Demandes récentes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="priorities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">Classement des intégrations</CardTitle>
                <CardDescription className="text-gray-700 font-medium">
                  Triées par MRR total des demandes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {priorities.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 text-lg">Aucune intégration demandée pour le moment</p>
                    <p className="text-gray-500 text-sm mt-2">Les demandes apparaîtront ici une fois soumises</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {priorities.map((priority, index) => (
                      <Card key={priority.name} className="hover:shadow-lg transition-shadow duration-200 border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white shadow-sm border border-gray-200">
                                {getIntegrationLogo(priority.name) ? (
                                  <Image
                                    src={getIntegrationLogo(priority.name)!}
                                    alt={`${priority.name} logo`}
                                    width={20}
                                    height={20}
                                    className="object-contain"
                                    onError={(e) => {
                                      // Fallback to rank number if logo fails
                                      const target = e.target as HTMLImageElement
                                      target.style.display = 'none'
                                      target.parentElement!.innerHTML = `<div class="flex items-center justify-center w-6 h-6 rounded-full bg-gray-500 text-white font-bold text-xs">${index + 1}</div>`
                                    }}
                                  />
                                ) : (
                                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-500 text-white font-bold text-xs">
                                    {index + 1}
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1">
                                  <h3 className="text-base font-bold text-gray-900 truncate">{priority.name}</h3>
                                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-500 text-white font-bold text-xs flex-shrink-0">
                                    {index + 1}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <Badge className={`${getStatusColor(priority.status)} text-white text-xs`}>
                              {getStatusLabel(priority.status)}
                            </Badge>
                          </div>

                          {/* MRR Section */}
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                              <div className="flex items-center gap-1 mb-1">
                                <Euro className="h-3 w-3 text-red-600" />
                                <span className="text-xs font-semibold text-red-800">À Risque</span>
                              </div>
                              <p className="text-lg font-bold text-red-700">{(priority.mrr_at_risk || 0).toLocaleString()}€</p>
                              <p className="text-xs text-red-600">{priority.current_clients_count || 0} clients</p>
                            </div>
                            
                            <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                              <div className="flex items-center gap-1 mb-1">
                                <TrendingUp className="h-3 w-3 text-green-600" />
                                <span className="text-xs font-semibold text-green-800">Potentiel</span>
                              </div>
                              <p className="text-lg font-bold text-green-700">{(priority.mrr_prospects || 0).toLocaleString()}€</p>
                              <p className="text-xs text-green-600">{priority.prospects_count || 0} prospects</p>
                            </div>
                          </div>

                          {/* Impact Total */}
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <Building2 className="h-3 w-3 text-gray-600" />
                                <span className="text-xs font-semibold text-gray-800">Impact Total</span>
                              </div>
                              <p className="text-lg font-bold text-gray-800">
                                {((priority.mrr_at_risk || 0) + (priority.mrr_prospects || 0)).toLocaleString()}€
                              </p>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="font-medium text-gray-700">Priorité</span>
                              <span className="text-gray-500">{priority.vote_count || 0} demande{(priority.vote_count || 0) > 1 ? 's' : ''}</span>
                            </div>
                            <Progress 
                              value={Math.min(((priority.total_mrr_potential || 0) / Math.max(...priorities.map(p => p.total_mrr_potential || 0), 1)) * 100, 100)} 
                              className="h-2"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="votes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">Demandes récentes</CardTitle>
                <CardDescription className="text-gray-700 font-medium">
                  Dernières demandes d'intégration soumises par les commerciaux
                </CardDescription>
              </CardHeader>
              <CardContent>
                {votes.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 text-lg">Aucune demande soumise</p>
                    <p className="text-gray-500 text-sm mt-2">Les demandes des commerciaux apparaîtront ici</p>
                  </div>
                ) : (
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Restaurant</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>MRR Potentiel</TableHead>
                      <TableHead>Intégration</TableHead>
                      <TableHead>Commercial</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {votes.map((vote) => (
                      <TableRow key={vote.id}>
                        <TableCell className="font-medium">{vote.restaurant_name}</TableCell>
                        <TableCell>
                          <Badge variant={vote.client_type === 'current_client' ? 'destructive' : 'default'} className="text-xs">
                            {vote.client_type === 'current_client' ? 'Client' : 'Prospect'}
                          </Badge>
                        </TableCell>
                        <TableCell>{(vote.mrr_potential || 0).toLocaleString()}€</TableCell>
                        <TableCell>
                          <Badge variant="outline">{vote.integration_name}</Badge>
                        </TableCell>
                        <TableCell>{vote.sales_person}</TableCell>
                        <TableCell>
                          {new Date(vote.created_at).toLocaleDateString('fr-FR')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
'use client'

import { useState } from 'react'
import { VoteForm } from '@/components/vote-form'
import { Dashboard } from '@/components/dashboard'
import { VotesHistory } from '@/components/votes-history'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PlusCircle, BarChart3, History } from 'lucide-react'

export default function Home() {
  const [refreshDashboard, setRefreshDashboard] = useState(0)

  const handleVoteSuccess = () => {
    setRefreshDashboard(prev => prev + 1)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Lightspeed Integration Prioritization
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            You need an integration to make money flow ? Let's vote for it baby !
          </p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto bg-green-800">
            <TabsTrigger value="dashboard" className="flex items-center gap-2 text-white data-[state=active]:bg-green-600 data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="vote" className="flex items-center gap-2 text-white data-[state=active]:bg-green-600 data-[state=active]:text-white">
              <PlusCircle className="h-4 w-4" />
              Nouvelle demande
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2 text-white data-[state=active]:bg-green-600 data-[state=active]:text-white">
              <History className="h-4 w-4" />
              Historique
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setRefreshDashboard(prev => prev + 1)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
              >
                🔄 Rafraîchir les données
              </button>
            </div>
            <Dashboard key={refreshDashboard} />
          </TabsContent>

          <TabsContent value="vote" className="space-y-6">
            <div className="max-w-4xl mx-auto">
              <VoteForm onSuccess={handleVoteSuccess} />
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setRefreshDashboard(prev => prev + 1)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
              >
                🔄 Rafraîchir l'historique
              </button>
            </div>
            <VotesHistory key={refreshDashboard} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

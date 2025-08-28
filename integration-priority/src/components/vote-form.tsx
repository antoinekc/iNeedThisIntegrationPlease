'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { IntegrationSelector } from '@/components/integration-selector'
import { Vote, Building2, Users2 } from 'lucide-react'


interface VoteFormProps {
  onSuccess?: () => void
}

export function VoteForm({ onSuccess }: VoteFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    restaurantName: '',
    mrrPotential: '',
    integrationName: '',
    salesPerson: '',
    clientType: '', // 'current_client' or 'prospect'
    salesforceLink: '',
    notes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate required fields
      if (!formData.restaurantName) {
        alert('⚠️ Le nom du restaurant est requis.')
        setIsLoading(false)
        return
      }
      
      if (!formData.mrrPotential) {
        alert('⚠️ Le MRR potentiel est requis.')
        setIsLoading(false)
        return
      }
      
      if (!formData.integrationName) {
        alert('⚠️ Veuillez sélectionner une intégration.')
        setIsLoading(false)
        return
      }
      
      if (!formData.salesPerson) {
        alert('⚠️ Le nom du commercial est requis.')
        setIsLoading(false)
        return
      }
      
      if (!formData.clientType) {
        alert('⚠️ Veuillez sélectionner le type de client.')
        setIsLoading(false)
        return
      }

      // Check if Supabase is properly configured
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('example')) {
        alert('⚠️ Supabase n\'est pas configuré. Veuillez configurer vos variables d\'environnement.')
        setIsLoading(false)
        return
      }

      const integrationName = formData.integrationName

      // Ensure the integration exists
      const { error: integrationError } = await supabase
        .from('integrations')
        .upsert({ 
          name: integrationName,
          description: undefined
        }, { 
          onConflict: 'name',
          ignoreDuplicates: true 
        })

      if (integrationError) throw integrationError

      // Insert the vote (compatibility mode until migration is run)
      const mrrValue = parseFloat(formData.mrrPotential)
      const voteData = {
        restaurant_name: formData.restaurantName,
        mrr: mrrValue, // Old column (still required)
        mrr_potential: mrrValue, // New column 
        integration_name: integrationName,
        sales_person: formData.salesPerson,
        client_type: formData.clientType || 'current_client', // Default if null
        salesforce_link: formData.salesforceLink || null,
        notes: formData.notes || null
      }
      
      console.log('🔍 Inserting vote with data:', voteData)
      
      const voteResponse = await supabase
        .from('votes')
        .insert(voteData)

      console.log('🔍 Vote response:', voteResponse)

      if (voteResponse.error) {
        console.error('❌ Detailed vote error:', {
          message: voteResponse.error.message,
          details: voteResponse.error.details,
          hint: voteResponse.error.hint,
          code: voteResponse.error.code
        })
        throw new Error(voteResponse.error.message || 'Unknown error')
      }

      // Reset form
      setFormData({
        restaurantName: '',
        mrrPotential: '',
        integrationName: '',
        salesPerson: '',
        clientType: '',
        salesforceLink: '',
        notes: ''
      })
      
      alert('✅ Demande ajoutée avec succès!')
      onSuccess?.()
    } catch (error) {
      console.error('Error submitting vote:', error)
      
      let errorMessage = '❌ Erreur lors de l\'ajout du vote.'
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage += ` ${error.message}`
      }
      
      alert(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative z-10">
      <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Nouvelle demande d&apos;intégration
            </h2>
            <p className="text-gray-600">
              Ajoutez une demande d&apos;intégration avec les détails du restaurant
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations du restaurant */}
            <div className="border border-gray-200 p-5 rounded-lg">
              <h3 className="text-base font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-600" />
                Informations du restaurant
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="restaurantName" className="text-sm font-bold text-gray-900">
                    Nom du restaurant *
                  </Label>
                  <Input
                    id="restaurantName"
                    value={formData.restaurantName}
                    onChange={(e) => {
                      // Permettre lettres, chiffres, espaces, tirets, apostrophes et caractères courants pour noms d'établissements
                      const value = e.target.value.replace(/[^a-zA-ZÀ-ÿ0-9\s\-'&.]/g, '')
                      setFormData(prev => ({ ...prev, restaurantName: value }))
                    }}
                    required
                    placeholder="Ex: Restaurant Le Gourmet"
                    className="h-12 text-base"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mrrPotential" className="text-sm font-bold text-gray-900">
                    MRR potentiel (€) *
                  </Label>
                  <Input
                    id="mrrPotential"
                    type="text"
                    inputMode="decimal"
                    value={formData.mrrPotential}
                    onChange={(e) => {
                      // Ne permettre que les chiffres, point décimal et virgule
                      const value = e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.')
                      // S'assurer qu'il n'y a qu'un seul point décimal
                      const parts = value.split('.')
                      if (parts.length > 2) {
                        const formattedValue = parts[0] + '.' + parts.slice(1).join('')
                        setFormData(prev => ({ ...prev, mrrPotential: formattedValue }))
                      } else {
                        setFormData(prev => ({ ...prev, mrrPotential: value }))
                      }
                    }}
                    required
                    placeholder="Ex: 1200"
                    className="h-12 text-base"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label className="text-sm font-bold text-gray-900">
                    Type de client *
                  </Label>
                  <div className="flex gap-6 mt-4">
                    <div className="flex items-center space-x-3">
                      <input
                        id="current_client"
                        type="radio"
                        name="clientType"
                        value="current_client"
                        checked={formData.clientType === 'current_client'}
                        onChange={(e) => setFormData(prev => ({ ...prev, clientType: e.target.value }))}
                        className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                        required
                      />
                      <label htmlFor="current_client" className="flex items-center gap-2 text-sm font-medium text-gray-900 cursor-pointer">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        Client Lightspeed
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <input
                        id="prospect"
                        type="radio"
                        name="clientType"
                        value="prospect"
                        checked={formData.clientType === 'prospect'}
                        onChange={(e) => setFormData(prev => ({ ...prev, clientType: e.target.value }))}
                        className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                      />
                      <label htmlFor="prospect" className="flex items-center gap-2 text-sm font-medium text-gray-900 cursor-pointer">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        Prospect
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salesPerson" className="text-sm font-bold text-gray-900">
                    Commercial *
                  </Label>
                  <Input
                    id="salesPerson"
                    value={formData.salesPerson}
                    onChange={(e) => {
                      // Ne permettre que les lettres, espaces, tirets et apostrophes
                      const value = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s\-']/g, '')
                      setFormData(prev => ({ ...prev, salesPerson: value }))
                    }}
                    required
                    placeholder="Ex: Jean Dupont"
                    className="h-12 text-base"
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="salesforceLink" className="text-sm font-bold text-gray-900">
                    Lien Salesforce
                  </Label>
                  <Input
                    id="salesforceLink"
                    type="url"
                    value={formData.salesforceLink}
                    onChange={(e) => setFormData(prev => ({ ...prev, salesforceLink: e.target.value }))}
                    placeholder="https://lightspeed.lightning.force.com/..."
                    className="h-12 text-base"
                  />
                </div>
              </div>
            </div>

            {/* Sélection de l'intégration */}
            <div>
              <IntegrationSelector
                selectedIntegration={formData.integrationName}
                onSelect={(integration) => {
                  setFormData(prev => ({ ...prev, integrationName: integration }))
                }}
              />
            </div>


            {/* Notes */}
            <div className="space-y-3">
              <Label htmlFor="notes" className="text-sm font-bold text-gray-900">
                Notes additionnelles
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Détails supplémentaires, urgence, contexte, deadline..."
                rows={4}
                className="text-base resize-none"
              />
            </div>

            {/* Bouton de soumission */}
            <div className="pt-4">
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="w-full h-14 text-lg font-semibold bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Ajout en cours...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Vote className="h-5 w-5" />
                    Ajouter la demande d'intégration
                  </div>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
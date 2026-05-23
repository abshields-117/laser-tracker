import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

const LaserSessionLogger = () => {
  const [patient, setPatient] = useState({ name: 'Sarah Smith', skinType: 'III', package: 'The Essential Duo' });
  const [sessionData, setSessionData] = useState({
    area: 'Underarms',
    fluence: '',
    pulseWidth: '',
    spotSize: '18mm',
    cooling: 'High',
    reaction: []
  });

  const handleSave = () => {
    console.log("Saving to Secure DB:", sessionData);
    alert("Session 4/8 Logged Successfully! Next Appt: April 12, 2026");
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-slate-50 min-h-screen">
      
      {/* Patient Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">{patient.name}</h1>
        <div className="flex gap-4 text-sm text-slate-500 mt-1">
          <span>Fitzpatrick: {patient.skinType}</span>
          <span>•</span>
          <span className="text-blue-600 font-semibold">{patient.package}</span>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
            <span>Session 4 of 8</span>
            <span>50% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '50%' }}></div>
          </div>
        </div>
      </div>

      {/* Session Log Form */}
      <Card>
        <CardHeader>
          <CardTitle>Log Treatment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Area Treated</label>
              <Select defaultValue="Underarms">
                <SelectTrigger><SelectValue placeholder="Select Area" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Underarms">Underarms</SelectItem>
                  <SelectItem value="Brazilian">Brazilian</SelectItem>
                  <SelectItem value="Legs">Full Legs</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Spot Size</label>
              <Select defaultValue="18mm">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="18mm">18mm (Square)</SelectItem>
                  <SelectItem value="24mm">24mm (Square)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Fluence (J/cm²)</label>
              <Input placeholder="e.g. 14" type="number" />
            </div>
            <div>
              <label className="text-sm font-medium">Pulse Width (ms)</label>
              <Input placeholder="e.g. 20" type="number" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Skin Reaction</label>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="erythema" />
                <label htmlFor="erythema" className="text-sm">Mild Erythema</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="edema" />
                <label htmlFor="edema" className="text-sm">PFE (Edema)</label>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Treatment Notes</label>
            <Textarea placeholder="Patient noted sensitivity on left side. Reduced fluence by 1J." />
          </div>

          <Button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            Save Session & Calculate Next Date
          </Button>

        </CardContent>
      </Card>
    </div>
  );
};

export default LaserSessionLogger;

import React, { useState } from 'react';
import { 
  Save, Brain, Info, Split, Globe, Filter, MinusCircle, Zap, ChevronsUp, 
  HeartPulse, AlertCircle, Tag, User, CheckCircle2,
  CloudLightning, ShieldX, Compass, Scale, Users,
  Sun, CloudRain, Wind, Flame, Ghost, ShieldAlert, XCircle, Stars, UserMinus, Anchor,
  EyeOff, HeartHandshake, Layers, Rocket, Lock, Search, CircleCheck, Eye, Coffee, Trophy,
  Smile
} from 'lucide-react';
import { DISTORSIONES } from '../data/distorsiones';
import { EMOCIONES } from '../data/emociones';

const MOODS = [
  { id: 'feliz', label: 'Feliz', color: '#10b981' },
  { id: 'triste', label: 'Triste', color: '#3b82f6' },
  { id: 'ansioso', label: 'Ansioso', color: '#f59e0b' },
  { id: 'enojado', label: 'Enojado', color: '#ef4444' },
  { id: 'neutro', label: 'Neutro', color: '#94a3b8' },
];

const DistortionIconMap = {
  Split: <Split size={18} />,
  Globe: <Globe size={18} />,
  Filter: <Filter size={18} />,
  MinusCircle: <MinusCircle size={18} />,
  Zap: <Zap size={18} />,
  ChevronsUp: <ChevronsUp size={18} />,
  HeartPulse: <HeartPulse size={18} />,
  AlertCircle: <AlertCircle size={18} />,
  Tag: <Tag size={18} />,
  User: <User size={18} />,
  CloudLightning: <CloudLightning size={18} />,
  ShieldX: <ShieldX size={18} />,
  Compass: <Compass size={18} />,
  Scale: <Scale size={18} />,
  Users: <Users size={18} />
};

const EmotionIconMap = {
  Sun: <Sun size={18} />,
  CloudRain: <CloudRain size={18} />,
  Wind: <Wind size={18} />,
  Flame: <Flame size={18} />,
  Ghost: <Ghost size={18} />,
  ShieldAlert: <ShieldAlert size={18} />,
  XCircle: <XCircle size={18} />,
  Stars: <Stars size={18} />,
  UserMinus: <UserMinus size={18} />,
  Anchor: <Anchor size={18} />,
  EyeOff: <EyeOff size={18} />,
  HeartHandshake: <HeartHandshake size={18} />,
  Layers: <Layers size={18} />,
  Rocket: <Rocket size={18} />,
  Lock: <Lock size={18} />,
  Search: <Search size={18} />,
  CircleCheck: <CircleCheck size={18} />,
  Eye: <Eye size={18} />,
  Coffee: <Coffee size={18} />,
  Trophy: <Trophy size={18} />
};

export default function RegistroForm({ onSave, editingRegistro = null, onCancelEdit }) {
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    estadoAnimo: 'neutro',
    intensidad: 5,
    situacion: '',
    pensamientos: '',
    emocionesSeleccionadas: [],
    distorsiones: [],
    conducta: '',
    pensamientoAlternativo: ''
  });

  // Efecto para cargar datos si estamos editando
  React.useEffect(() => {
    if (editingRegistro) {
      setFormData({
        fecha: editingRegistro.fecha || new Date().toISOString().split('T')[0],
        estadoAnimo: editingRegistro.estadoAnimo || 'neutro',
        intensidad: editingRegistro.intensidad || 5,
        situacion: editingRegistro.situacion || '',
        pensamientos: editingRegistro.pensamientos || '',
        emocionesSeleccionadas: editingRegistro.emocionesSeleccionadas || [],
        distorsiones: editingRegistro.distorsiones || [],
        conducta: editingRegistro.conducta || '',
        pensamientoAlternativo: editingRegistro.pensamientoAlternativo || ''
      });
    } else {
      // Si no hay nada editando, resetear
      setFormData({
        fecha: new Date().toISOString().split('T')[0],
        estadoAnimo: 'neutro',
        intensidad: 5,
        situacion: '',
        pensamientos: '',
        emocionesSeleccionadas: [],
        distorsiones: [],
        conducta: '',
        pensamientoAlternativo: ''
      });
    }
  }, [editingRegistro]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleSelection = (key, id) => {
    setFormData(prev => {
      const isSelected = prev[key].includes(id);
      if (isSelected) {
        return { ...prev, [key]: prev[key].filter(item => item !== id) };
      } else {
        return { ...prev, [key]: [...prev[key], id] };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      // Solo generamos un ID nuevo si no tenemos uno (modo demo nuevo)
      id: editingRegistro?.id || Date.now(),
      fechaFormateada: new Date(formData.fecha).toLocaleDateString('es-ES')
    });
    // Reset basic fields
    setFormData(prev => ({
      ...prev,
      situacion: '',
      pensamientos: '',
      emocionesSeleccionadas: [],
      distorsiones: [],
      conducta: '',
      pensamientoAlternativo: ''
    }));
  };

  return (
    <div className="fade-in">
      <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Brain size={28} color="var(--accent-primary)" />
        {editingRegistro ? 'Editar Registro' : 'Nuevo Registro Diario'}
      </h2>
      
      <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div className="grid grid-2">
          <div className="form-group">
            <label className="form-label">Fecha</label>
            <input 
              type="date" 
              name="fecha" 
              className="form-control" 
              value={formData.fecha}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Estado de Ánimo</label>
            <select 
              name="estadoAnimo" 
              className="form-control" 
              value={formData.estadoAnimo}
              onChange={handleChange}
            >
              {MOODS.map(mood => (
                <option key={mood.id} value={mood.id}>{mood.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Intensidad (1-10): {formData.intensidad}</label>
          <input 
            type="range" 
            name="intensidad" 
            min="1" 
            max="10" 
            className="form-control" 
            style={{ padding: '0.5rem 0' }}
            value={formData.intensidad}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Situación o Evento</label>
          <textarea 
            name="situacion" 
            className="form-control" 
            rows="2" 
            placeholder="¿Qué sucedió?..." 
            value={formData.situacion}
            onChange={handleChange}
            required
          ></textarea>
        </div>

        <div className="form-group">
          <label className="form-label">Pensamientos Automáticos</label>
          <textarea 
            name="pensamientos" 
            className="form-control" 
            rows="2" 
            placeholder="¿Qué te dijiste a ti mismo?" 
            value={formData.pensamientos}
            onChange={handleChange}
            required
          ></textarea>
        </div>

        {/* Emotions Selection */}
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Smile size={16} color="var(--accent-secondary)" />
            Emociones Experimentadas
          </label>
          <div className="grid grid-2" style={{ gap: '0.5rem', marginTop: '0.5rem' }}>
            {EMOCIONES.map(emo => (
              <div 
                key={emo.id}
                onClick={() => toggleSelection('emocionesSeleccionadas', emo.id)}
                style={{
                  padding: '0.6rem 0.75rem',
                  borderRadius: 'var(--radius)',
                  border: '1px solid',
                  borderColor: formData.emocionesSeleccionadas.includes(emo.id) ? 'var(--accent-secondary)' : 'var(--border)',
                  backgroundColor: formData.emocionesSeleccionadas.includes(emo.id) ? 'rgba(45, 212, 191, 0.15)' : 'var(--bg-primary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
              >
                <div style={{ color: formData.emocionesSeleccionadas.includes(emo.id) ? 'var(--accent-secondary)' : 'var(--text-secondary)' }}>
                  {EmotionIconMap[emo.icono]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: '500' }}>{emo.titulo}</div>
                </div>
                {formData.emocionesSeleccionadas.includes(emo.id) && (
                  <CheckCircle2 size={14} color="var(--accent-secondary)" style={{ flexShrink: 0 }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Cognitive Distortions Selection */}
        <div className="form-group" style={{ marginTop: '0.5rem' }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={16} color="var(--warning)" />
            Posibles Distorsiones Cognitivas
          </label>
          <div className="grid grid-2" style={{ gap: '0.5rem', marginTop: '0.5rem' }}>
            {DISTORSIONES.map(dist => (
              <div 
                key={dist.id}
                onClick={() => toggleSelection('distorsiones', dist.id)}
                style={{
                  padding: '0.6rem 0.75rem',
                  borderRadius: 'var(--radius)',
                  border: '1px solid',
                  borderColor: formData.distorsiones.includes(dist.id) ? 'var(--accent-primary)' : 'var(--border)',
                  backgroundColor: formData.distorsiones.includes(dist.id) ? 'var(--accent-muted)' : 'var(--bg-primary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem'
                }}
              >
                <div style={{ color: formData.distorsiones.includes(dist.id) ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                  {DistortionIconMap[dist.icono]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.1rem' }}>{dist.titulo}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: '1.2' }}>{dist.descripcion}</div>
                </div>
                {formData.distorsiones.includes(dist.id) && (
                  <CheckCircle2 size={14} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Conducta o Reacción</label>
          <textarea 
            name="conducta" 
            className="form-control" 
            rows="2" 
            placeholder="¿Qué hiciste?" 
            value={formData.conducta}
            onChange={handleChange}
            required
          ></textarea>
        </div>

        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Pensamiento Alternativo <span style={{ color: 'var(--text-secondary)', fontWeight: 'normal', fontSize: '0.85rem' }}>(Opcional)</span>
          </label>
          <textarea 
            name="pensamientoAlternativo" 
            className="form-control" 
            rows="2" 
            placeholder="Un enfoque más equilibrado o racional..." 
            value={formData.pensamientoAlternativo}
            onChange={handleChange}
          ></textarea>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          {editingRegistro && (
            <button 
              type="button" 
              onClick={onCancelEdit} 
              className="btn btn-secondary" 
              style={{ flex: 1 }}
            >
              Cancelar
            </button>
          )}
          <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
            <Save size={20} />
            {editingRegistro ? 'Guardar Cambios' : 'Guardar Registro'}
          </button>
        </div>

        <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'var(--accent-muted)', borderRadius: 'var(--radius)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <Info size={18} style={{ marginTop: '2px', flexShrink: 0 }} />
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                <strong>Nota TCC:</strong> Identificar y nombrar nuestras emociones es un paso fundamental para la autorregulación emocional.
            </p>
        </div>
      </form>
    </div>
  );
}

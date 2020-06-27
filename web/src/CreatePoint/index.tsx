import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom'; // troca de conteúdo durante a troca de rota
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker} from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';
import { toast } from 'react-toastify';
import Dropzone from '../components/Dropzone';
import axios from 'axios';
import api from '../services/api';

import './styles.css';
import logo from '../assets/logo.svg';

interface Item {
   id: number;
   title: string;
   image_url: string;
}

interface UF {
    sigla: string;
}

interface City {
    nome: string;
}

const CreatePoint = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [ufs, setUfs] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedUF, setSelectedUF] = useState('0');
  const [selectedCity, setSelectedCity] = useState('0');
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);
  const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);
  const [selectedItem, setSelectedItem] = useState<number[]>([]);
  const [selectedFile, setSelectedFile] = useState<File>();
  const [formData, setFormData] = useState({
      name: '', 
      email: '',
      whatsapp: '',
  });

  const history = useHistory();

  useEffect(() => {
      api.get('items').then(response => {
          setItems(response.data);
      });

      axios.get<UF[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
        const ufInitials = response.data.map(uf => uf.sigla).sort();
        setUfs(ufInitials);
      });

      navigator.geolocation.getCurrentPosition(position => {
          const { latitude, longitude } = position.coords
          setInitialPosition([latitude, longitude]);
      })

  }, []);

  useEffect(() => {

    if(selectedUF === '0'){
       return;
    }

    axios.get<City[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios`).then(response => {
      const cities = response.data.map(city => city.nome);
      setCities(cities);
    });

  }, [selectedUF]);

  const toastOptions = {
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  };

  function selectUF(event: ChangeEvent<HTMLSelectElement>) {
      const uf = event.target.value
      setSelectedUF(uf);
  }

  function selectCity(event: ChangeEvent<HTMLSelectElement>) {
    const city = event.target.value
    setSelectedCity(city);
  } 

  function selectPosition(event: LeafletMouseEvent) {
    setSelectedPosition([
        event.latlng.lat,
        event.latlng.lng,
    ]) 
  }

  function changeInput(event: ChangeEvent<HTMLInputElement>) {
      const {name, value } = event.target;
     setFormData({...formData, [name]: value})
  }

  function selectItem(id: number) {
    const alreadySelected = selectedItem.findIndex(item => item === id);

    if(alreadySelected >= 0) {
        const filteredItems = selectedItem.filter(item => item !== id);
        setSelectedItem(filteredItems);
    } else {
        setSelectedItem([...selectedItem, id]);
    }
  }

  async function createPoint(event: FormEvent){
    event.preventDefault();

    try {
        const { name, email, whatsapp } = formData;
        const [latitude, longitude] = selectedPosition;

        const data = new FormData();

        data.append('name', name);
        data.append('email', email);
        data.append('whatsapp', whatsapp);
        data.append('latitude', String(latitude));
        data.append('longitude', String(longitude));
        data.append('uf', selectedUF);
        data.append('city', selectedCity);
        data.append('items', selectedItem.join(','));

        if (selectedFile) {
          data.append('image', selectedFile);
        }

        await api.post('points', data);

        history.push('/sucesso');

    } catch (error) {
        toast.error('Erro!', toastOptions);
    }
    
  }

  return (
     <div id="page-create-point">
         <header>
             <img src={logo} alt="Ecoleta"/>
             <Link to="/">
                <FiArrowLeft />
                 Voltar para home
             </Link>
         </header>
         <form onSubmit={createPoint}>
            <h1>Cadastro do <br/>ponto de coleta</h1>
            <Dropzone onFileUploaded={setSelectedFile} />
            <fieldset>
                <legend>
                    <h2>Dados</h2>
                </legend>
                <div className="field">
                    <label htmlFor="name">Nome da entidade</label>
                    <input
                    type="text"
                    name="name"
                    id="name"
                    onChange={changeInput}
                    />
                </div>
                <div className="field-group">
                    <div className="field">
                        <label htmlFor="name">Email</label>
                        <input
                        type="email"
                        name="email"
                        id="email"
                        onChange={changeInput}
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="name">Whatsapp</label>
                        <input
                        maxLength={11}
                        type="text"
                        name="whatsapp"
                        id="whatsapp"
                        onChange={changeInput}
                        />
                    </div>
                </div>
            </fieldset>

            <fieldset>
                <legend>
                    <h2>Endereço</h2>
                    <span>Selecione o endereço no mapa</span>
                </legend>

                <Map center={initialPosition} zoom={15} onClick={selectPosition}>
                    <TileLayer 
                        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={selectedPosition} />
                </Map>

                <div className="field-group">
                    <div className="field">
                        <label htmlFor="uf">Estado</label>
                        <select name="uf" id="uf" value={selectedUF} onChange={selectUF}>
                            <option value="0">Selecione um Estado</option>
                            {ufs.map(uf => (
                                <option key={uf} value={uf}>{uf}</option>
                            ))}
                        </select>
                    </div>
                    <div className="field">
                        <label htmlFor="city">Cidade</label>
                        <select name="city" id="city" value={selectedCity} onChange={selectCity}>
                            <option value="0">Selecione uma Cidade</option>
                            {cities.map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </fieldset>

            
            <fieldset>
                <legend>
                    <h2>Itens de coleta</h2>
                    <span>Selecione um ou mais itens abaixo</span>
                </legend>

                <ul className="items-grid">
                    {items.map(item => (
                        <li key={item.id} 
                        onClick={() => selectItem(item.id)} className={selectedItem.includes(item.id) ? 'selected': ''}>
                            <img src={item.image_url} alt={item.title}/>
                            <span>{item.title}</span>
                        </li>
                    ))}        
                </ul>
            </fieldset>

            <button type="submit">
                Cadastrar ponto de coleta
            </button>
         </form>
     </div>
    );
}

export default CreatePoint;
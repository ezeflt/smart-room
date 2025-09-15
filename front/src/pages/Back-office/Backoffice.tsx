import React, { useState, useEffect } from 'react';
import './Back-office.css';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUser, deleteUser, createUser, checkAdminStatus } from '../../protocol/api';
import { getAuthToken } from '../../store/user';
import config from '../../config.json';
const prodApiKey = (import.meta as any).env.VITE_API as string;
const localApiKey = (config as any).VITE_API as string;
const ENV = (process as any)?.env?.ENVIRONMENT || (import.meta as any).env.VITE_ENVIRONMENT as string;
const SERVER_URL = ENV === 'local' ? localApiKey : prodApiKey;

interface User {
    _id: string;
    username: string;
    mail: string;
    role: string;
}

interface Room {
    _id: string;
    name: string;
}

const BackOffice = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [users, setUsers] = useState<User[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [newUser, setNewUser] = useState({
        username: '',
        mail: '',
        password: '',
        confirmPassword: '',
        role: 'client'
    });
    const [rooms, setRooms] = useState<Room[]>([]);
    const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
    const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string>('');

    // Vérification du token et du statut admin
    useEffect(() => {
        const verifyAccess = async () => {
            const token = localStorage.getItem('authToken');
            
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                // Vérifier si le token est valide et si l'utilisateur est admin
                const userData = await checkAdminStatus();
                
                if (userData.role !== 'admin') {
                    alert('Vous n\'avez pas les droits d\'administrateur pour accéder à cette page.');
                    navigate('/weather');
                    return;
                }
                
                // Utilisateur est admin, peut accéder à la page
            } catch (error) {
                // Si c'est une erreur 401 (non autorisé) ou 403 (forbidden), 
                // c'est probablement que l'utilisateur n'est pas admin ou que le token est invalide
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    alert('Vous n\'avez pas les droits d\'administrateur pour accéder à cette page.');
                    navigate('/weather');
                    return;
                }
                
                // Autre erreur (erreur serveur, etc.)
                navigate('/login');
                return;
            }
        };

        verifyAccess();
    }, [navigate]);

    const { data: usersData, isLoading, error: queryError } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const token = getAuthToken();
            if (!token) {
                throw new Error('Token not found');
            }
            const response = await fetch(`${SERVER_URL}/user`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des utilisateurs');
            }
            return response.json();
        },
    });

    const { data: roomsData } = useQuery({
        queryKey: ['rooms'],
        queryFn: async () => {
            const token = getAuthToken();
            if (!token) {
                throw new Error('Token not found');
            }
            const response = await fetch(`${SERVER_URL}/rooms`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des salles');
            }
            return response.json();
        },
    });

    React.useEffect(() => {
        if (usersData) {
            console.log('Données reçues de l\'API:', usersData);
            setUsers(usersData.users || usersData);
        }
    }, [usersData]);

    React.useEffect(() => {
        if (roomsData) {
            setRooms(roomsData.rooms || []);
        }
    }, [roomsData]);

    // Mutation pour créer un utilisateur
    const createUserMutation = useMutation({
        mutationFn: async (userData: { username: string; mail: string; password: string; confirmPassword: string; role: string }) => {
            return await createUser(userData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setNewUser({ username: '', mail: '', password: '', confirmPassword: '', role: 'client' });
            setIsCreateModalOpen(false);
        },
        onError: (error) => {
            console.error('Erreur lors de la création:', error);
            alert('Erreur lors de la création de l\'utilisateur');
        }
    });

    const handleCreateUser = () => {
        if (newUser.username && newUser.mail && newUser.password && newUser.password === newUser.confirmPassword) {
            createUserMutation.mutate({
                username: newUser.username,
                mail: newUser.mail,
                password: newUser.password,
                confirmPassword: newUser.confirmPassword,
                role: newUser.role
            });
        } else if (newUser.password !== newUser.confirmPassword) {
            alert('Les mots de passe ne correspondent pas');
        } else {
            alert('Veuillez remplir tous les champs');
        }
    };

    const updateUserMutation = useMutation({
        mutationFn: async (userData: { userId: string; username: string; mail: string; role: string }) => {
            const { userId, ...updateData } = userData;
            return await updateUser(userId, updateData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setIsEditModalOpen(false);
            setSelectedUser(null);
        },
        onError: (error) => {
            console.error('Erreur lors de la modification:', error);
            alert('Erreur lors de la modification de l\'utilisateur');
        }
    });

    const deleteUserMutation = useMutation({
        mutationFn: async (userId: string) => {
            return await deleteUser(userId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error) => {
            console.error('Erreur lors de la suppression:', error);
            alert('Erreur lors de la suppression de l\'utilisateur');
        }
    });

    const assignRoomsMutation = useMutation({
        mutationFn: async ({ userId, roomIds }: { userId: string; roomIds: string[] }) => {
            const token = getAuthToken();
            if (!token) {
                throw new Error('Token not found');
            }
            const response = await fetch(`${SERVER_URL}/user/${userId}/rooms`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ roomIds })
            });
            if (!response.ok) {
                throw new Error('Erreur lors de l\'assignation des salles');
            }
            return response.json();
        },
        onSuccess: () => {
            setIsRoomModalOpen(false);
            setSelectedRooms([]);
            setCurrentUserId('');
        },
        onError: (error) => {
            console.error('Erreur lors de l\'assignation des salles:', error);
            alert('Erreur lors de l\'assignation des salles');
        }
    });

    const handleEditUser = () => {
        if (selectedUser) {
            updateUserMutation.mutate({
                userId: selectedUser._id,
                username: selectedUser.username,
                mail: selectedUser.mail,
                role: selectedUser.role
            });
        }
    };

    const handleDeleteUser = (userId: string) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
            deleteUserMutation.mutate(userId);
        }
    };

    const openEditModal = (user: User) => {
        setSelectedUser({ ...user });
        setIsEditModalOpen(true);
    };

    const openRoomModal = async (userId: string) => {
        setCurrentUserId(userId);
        setIsRoomModalOpen(true);
        
        try {
            const token = getAuthToken();
            if (!token) {
                throw new Error('Token not found');
            }
            const response = await fetch(`${SERVER_URL}/user/${userId}/rooms`, {  
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setSelectedRooms(data.roomIds || []);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des salles de l\'utilisateur:', error);
            setSelectedRooms([]);
        }
    };

    const handleRoomToggle = (roomId: string) => {
        setSelectedRooms(prev => 
            prev.includes(roomId) 
                ? prev.filter(id => id !== roomId)
                : [...prev, roomId]
        );
    };

    const handleAssignRooms = () => {
        assignRoomsMutation.mutate({
            userId: currentUserId,
            roomIds: selectedRooms
        });
    };

    return (
        <div className="backoffice-container">
            <div className="backoffice-header">
                <h1>Gestion des Utilisateurs</h1>
                <button 
                    className="create-user-btn"
                    onClick={() => setIsCreateModalOpen(true)}
                >
                    + Créer un utilisateur
                </button>
            </div>

            {isLoading && (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Chargement des utilisateurs...</p>
                </div>
            )}

            {queryError && (
                <div className="error-container">
                    <p className="error-message">{queryError.message}</p>
                    <button onClick={() => window.location.reload()}>Réessayer</button>
                </div>
            )}

            {!isLoading && !queryError && (
                <div className="users-table-container">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nom</th>
                                <th>Email</th>
                                <th>Rôle</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(users) && users.length > 0 ? (
                                users.map(user => (
                                    console.log(user),
                                    <tr key={user._id}>
                                        <td>{user._id}</td>
                                        <td>{user.username}</td>
                                        <td>{user.mail}</td>
                                        <td>
                                            <span className={`role-badge role-${user.role}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button 
                                                    className="edit-btn"
                                                    onClick={() => openEditModal(user)}
                                                    disabled={updateUserMutation.isPending}
                                                >
                                                    {updateUserMutation.isPending ? 'Modification...' : 'Modifier'}
                                                </button>
                                                <button 
                                                    className="assign-btn"
                                                    onClick={() => openRoomModal(user._id)}
                                                    disabled={assignRoomsMutation.isPending}
                                                >
                                                    {assignRoomsMutation.isPending ? 'Assignation...' : 'Assigner salles'}
                                                </button>
                                                <button 
                                                    className="delete-btn"
                                                    onClick={() => handleDeleteUser(user._id)}
                                                    disabled={deleteUserMutation.isPending}
                                                >
                                                    {deleteUserMutation.isPending ? 'Suppression...' : 'Supprimer'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                                        {Array.isArray(users) ? 'Aucun utilisateur trouvé' : 'Chargement...'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {isCreateModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Créer un nouvel utilisateur</h2>
                        <div className="form-group">
                            <label>Nom d'utilisateur:</label>
                            <input
                                type="text"
                                value={newUser.username}
                                onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                                placeholder="Nom d'utilisateur"
                            />
                        </div>
                        <div className="form-group">
                            <label>Email:</label>
                            <input
                                type="email"
                                value={newUser.mail}
                                onChange={(e) => setNewUser({...newUser, mail: e.target.value})}
                                placeholder="email@example.com"
                            />
                        </div>
                        <div className="form-group">
                            <label>Mot de passe:</label>
                            <input
                                type="password"
                                value={newUser.password}
                                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                                placeholder="Mot de passe"
                            />
                        </div>
                        <div className="form-group">
                            <label>Confirmer le mot de passe:</label>
                            <input
                                type="password"
                                value={newUser.confirmPassword}
                                onChange={(e) => setNewUser({...newUser, confirmPassword: e.target.value})}
                                placeholder="Confirmer le mot de passe"
                            />
                        </div>
                        <div className="form-group">
                            <label>Rôle:</label>
                            <select
                                value={newUser.role}
                                onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                            >
                                <option value="client">Client</option>
                                <option value="admin">Administrateur</option>
                            </select>
                        </div>
                        <div className="modal-actions">
                            <button 
                                onClick={handleCreateUser}
                                disabled={createUserMutation.isPending}
                            >
                                {createUserMutation.isPending ? 'Création...' : 'Créer'}
                            </button>
                            <button 
                                onClick={() => setIsCreateModalOpen(false)}
                                disabled={createUserMutation.isPending}
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isEditModalOpen && selectedUser && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Modifier l'utilisateur</h2>
                        <div className="form-group">
                            <label>Nom:</label>
                            <input
                                type="text"
                                value={selectedUser.username}
                                onChange={(e) => setSelectedUser({...selectedUser, username: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label>Email:</label>
                            <input
                                type="email"
                                value={selectedUser.mail}
                                onChange={(e) => setSelectedUser({...selectedUser, mail: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label>Rôle:</label>
                            <select
                                value={selectedUser.role}
                                onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value})}
                            >
                                <option value="client">Utilisateur</option>
                                <option value="admin">Administrateur</option>
                            </select>
                        </div>
                        <div className="modal-actions">
                            <button 
                                onClick={handleEditUser}
                                disabled={updateUserMutation.isPending}
                            >
                                {updateUserMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
                            </button>
                            <button 
                                onClick={() => setIsEditModalOpen(false)}
                                disabled={updateUserMutation.isPending}
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isRoomModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Assigner des salles à l'utilisateur</h2>
                        <div className="rooms-selection">
                            <h3>Sélectionnez les salles :</h3>
                            <div className="rooms-grid">
                                {rooms.map(room => (
                                    <div key={room._id} className="room-checkbox">
                                        <input
                                            type="checkbox"
                                            id={`room-${room._id}`}
                                            checked={selectedRooms.includes(room._id)}
                                            onChange={() => handleRoomToggle(room._id)}
                                        />
                                        <label htmlFor={`room-${room._id}`}>
                                            {room.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button 
                                onClick={handleAssignRooms}
                                disabled={assignRoomsMutation.isPending}
                            >
                                {assignRoomsMutation.isPending ? 'Assignation...' : 'Assigner'}
                            </button>
                            <button 
                                onClick={() => {
                                    setIsRoomModalOpen(false);
                                    setSelectedRooms([]);
                                    setCurrentUserId('');
                                }}
                                disabled={assignRoomsMutation.isPending}
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BackOffice;
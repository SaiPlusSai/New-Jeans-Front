<template>
  <v-container class="py-8">
    <v-row>
        <v-card class="mx-auto pa-6" max-width="800">
        <v-card-title class="text-h6 mb-4">
            {{ editing ? 'Modificar Usuario' : 'Registrar Usuario' }}
            <v-chip v-if="deletedUser" color="red" class="ml-2" small>
            Eliminado
            </v-chip>
            <v-chip v-if="user.id" color="blue" class="ml-2" small>
            {{ user.correo }}
            </v-chip>
        </v-card-title>

        <!-- Barra de búsqueda -->
        <v-row>
          <v-col cols="12">
            <v-text-field
                v-model="searchWord"
                append-inner-icon="mdi-magnify"
                density="compact"
                label="Buscar usuarios"
                variant="solo"
                single-line
                clearable
                @keydown.enter="searchUsers"
                @click:append-inner="searchUsers"
                hint="Ingrese el nombre, CI, correo o nombre de usuario"
                persistent-hint
            />
          </v-col>
        </v-row>

        <!-- Sección de filtro -->
        <v-row>
            <v-switch 
                class="input"
                v-model="onlyMiga" 
                label="Mostrar solo usuarios MIGA"
                @change="showOnlyMiga"
                :color="'green'"
            ></v-switch>
        </v-row>

        <!-- Resultados de búsqueda -->
        <v-row v-if="users.length > 0">
            <v-col cols="12">
            <v-card variant="outlined" class="mb-4">
                <v-card-title>Usuarios habilitados</v-card-title>
                <v-card-text>
                <div style="max-height: 500px; overflow-y: auto;">
                  <v-list>
                    <v-list-item
                    v-for="user in users"
                    :key="user.id"
                    @click="pickUser(user)"
                    class="cursor-pointer"
                    >
                    <template v-slot:prepend>
                        <v-icon :color="user.rol == 'COMUNIDAD' ? 'orange' : 'green'">
                        mdi-account
                        </v-icon>
                    </template>
                    <v-list-item-title>{{ user.apellidop }} {{ user.apellidom }} {{ user.nombres }}</v-list-item-title>
                    <v-list-item-subtitle>
                        CI: {{ user.carnet_ci }} - {{ user.Usuario_defecto }}
                    </v-list-item-subtitle>
                    <template v-slot:append>
                        <v-list-item-action>
                            <v-chip :color="user.rol == 'COMUNIDAD' ? 'orange' : 'green'" dark>
                                {{ user.rol === 'COMUNIDAD' ? 'COMUNIDAD' : 'MIGA'}}
                            </v-chip>
                        </v-list-item-action>
                    </template>
                    </v-list-item>
                  </v-list>
                </div>
                </v-card-text>
            </v-card>
            </v-col>
        </v-row>

        <!-- Formulario -->
        <v-form ref="targetUser" @submit.prevent="editing ? updateUser() : registerUser()">
            <v-row dense>
            <v-col cols="12" sm="6">
              <v-text-field 
              class="input"
              v-model="user.apellidop" 
              label="Apellido paterno del usuario *" 
              :rules="[v => !!v || 'Apellido paterno es requerido']"
              hint="Ejemplo: Carrasco"
              persistent-hint
              required
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field 
              class="input"
              v-model="user.apellidom" 
              label="Apellido materno del usuario *" 
              :rules="[v => !!v || 'Apellido materno es requerido']"
              hint="Ejemplo: Flores"
              persistent-hint
              required
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field 
              class="input"
              v-model="user.nombres" 
              label="Nombre/s del usuario *" 
              :rules="[v => !!v || 'Nombre/s es requerido']"
              hint="Ejemplo: José María"
              persistent-hint
              required
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field 
              class="input"
              type="number"
              v-model="user.carnet_ci" 
              label="Carnet de identidad del usuario *" 
              :rules="[v => !!v || 'Carnet de identidad es requerido']"
              required
              />
            </v-col>
            <v-col v-if="editing" cols="12" sm="4">
              <v-text-field 
              class="input"
              v-model="user.Usuario_defecto" 
              label="Nombre de usuario *" 
              :rules="[
                  v => !!v || 'Usuario es requerido']"
              hint="Ejemplo: jose.carrasco"
              persistent-hint
              required
              />
            </v-col>
            <v-col cols="12" :sm="editing ? 8 : 12">
              <v-text-field 
              class="input"
              v-model="user.correo" 
              label="Correo del usuario (opcional)" 
              :rules="[
                  v => !v || /.+@.+\..+/.test(v) || 'El correo no es válido']"
              hint="Ejemplo: ejemplo@gmail.com"
              persistent-hint
              required
              />
            </v-col>
            <v-col cols="12" sm="4">
              <v-select 
              class="input"
              v-model="user.macrodistrito_id" 
              :items="macrodistritos"
              item-title="nombre"
              item-value="id"
              label="Macrodistrito" 
              :rules="[v => !!v || 'Macrodistrito es requerido']"
              hint="El macrodistrito al que pertenece el usuario"
              persistent-hint
              required
              />
            </v-col>
            <v-col cols="12" sm="4">
              <v-select 
              class="input"
              v-model="user.zona_id" 
              :items="zonas"
              item-title="nombre_zona"
              item-value="id"
              label="Zona" 
              :rules="[v => !!v || 'Zona es requerida']"
              hint="La zona a la que pertenece el usuario"
              persistent-hint
              required
              :loading="loading"
              :disabled="!user.macrodistrito_id"
              />
            </v-col>
            <v-col cols="12" sm="4">
              <v-select 
              class="input"
              v-model="user.ambitoactividad_id" 
              :items="ambitos"
              item-title="nombre"
              item-value="id"
              label="Ámbito de actividad" 
              :rules="[v => !!v || 'Ámbito de actividad es requerido']"
              hint="El Ámbito de actividad del usuario"
              persistent-hint
              required
              />
            </v-col>
            <v-col v-if="!editing && isMiga" cols="12" sm="6">
              <v-text-field 
              class="input"
              :type="showPassword1 ? 'text' : 'password'"
              :append-inner-icon="showPassword1 ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPassword1 = !showPassword1"
              v-model="user.contraseña" 
              label="Contraseña del usuario *" 
              :rules="[
                  v => !!v || 'Contraseña es requerido',
                  v => v.length >= 6 || 'La contraseña debe tener al menos 6 caracteres']"
              required
              />
            </v-col>
            <v-col v-if="!editing && isMiga" cols="12" sm="6">
              <v-text-field 
              class="input"
              :type="showPassword2 ? 'text' : 'password'"
              :append-inner-icon="showPassword2 ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPassword2 = !showPassword2"
              v-model="confirmPass"
              label="Confirme la contraseña *" 
              :rules="[
                  v => !!v || 'Contraseña es requerido',
                  v => v.length >= 6 || 'La contraseña debe tener al menos 6 caracteres',
                  v => v === user.contraseña || 'Las contraseñas no coinciden']"
              hint="Vuelva a escribir la contraseña para confirmar"
              persistent-hint
              required
              />
            </v-col>
            <v-col cols="12">
              <v-checkbox 
              class="input"
              v-model="isMiga" 
              label="¿Es un usuario MIGA?"
              hint="Indica si el usuario tiene permisos de usuarios MIGA"
              persistent-hint
              />
            </v-col>
            </v-row>

            <div class="d-flex flex-wrap gap-2 mt-4">
            <v-btn type="submit" color="primary" :loading="loading">
                <v-icon start>mdi-content-save</v-icon>
                {{ editing ? 'Actualizar' : 'Registrar' }}
            </v-btn>

            <v-btn
                v-if="editing && !deletedUser"
                color="red"
                @click="deleteUser"
            >
                <v-icon start>mdi-delete</v-icon>
                Eliminar
            </v-btn>

            <v-btn
                v-if="editing && deletedUser"
                color="green"
                @click="restoreUser"
            >
                <v-icon start>mdi-restore</v-icon>
                Restaurar
            </v-btn>

            <v-btn
                v-if="editing"
                color="grey"
                @click="resetForm"
            >
                <v-icon start>mdi-cancel</v-icon>
                Cancelar
            </v-btn>
            </div>

            <p v-if="error" class="mt-3 text-red">{{ error }}</p>
        </v-form>
        </v-card>
    </v-row>

    <!-- Eliminados -->
    <v-row>
        <v-row v-if="deletedUsers.length > 0" class="pt-8">
          <v-card class="mx-auto pa-6" elevation="2" width="800">
            <v-card-title>Usuarios no habilitados</v-card-title>

            <v-row>
              <v-col cols="12">
                <v-alert v-if="loadingDel" type="info" variant="tonal">
                  Cargando usuarios no habilitados...
                </v-alert>

                <v-alert v-else-if="error" type="error" variant="tonal">
                  {{ error }}
                </v-alert>

                <v-table
                  v-else
                  class="elevation-1"
                  density="comfortable"
                >
                  <thead>
                    <tr>
                      <th class="text-left">
                        Nombre
                      </th>
                      <th class="text-left">
                        Usuario
                      </th>
                      <th class="text-left">
                        Correo
                      </th>
                      <th class="text-left">
                        Carnet de Identidad
                      </th>
                      <th class="text-left">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="user in deletedUsers"
                      :key="user.id"
                    >
                      <td>{{ user.apellidop }} {{ user.apellidom }} {{ user.nombres }}</td>
                      <td>{{ user.Usuario_defecto }}</td>
                      <td>{{ user.correo }}</td>
                      <td>{{ user.carnet_ci }}</td>
                      <td>
                        <v-btn class="ma-4" color="primary" @click="restoreUserById(user.id)">
                          <v-icon start>mdi-restore</v-icon>
                          Restaurar
                        </v-btn>
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </v-col>
            </v-row>
          </v-card>
        </v-row>

        <v-row v-else-if="!loadingDel" class="pt-8">
          <v-alert type="info" variant="tonal">
            No hay usuarios no habilitados para mostrar.
          </v-alert>
        </v-row>
    </v-row>

    <v-snackbar v-model="snackbar" color="green" timeout="3000">
      {{ snackbarContent }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar = false">Cerrar</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const token = localStorage.getItem('token')

const user = ref({
  id: null,
  nombres: '',
  apellidop: '',
  apellidom: '',
  carnet_ci: '',
  correo: '',
  contraseña: '',
  rol: '',
  Usuario_defecto: '',
  macrodistrito_id: null,
  zona_id: null,
  ambitoactividad_id: null
})

const snackbar = ref(false)
const snackbarContent = ref('')
const error = ref('')
const loading = ref(false)
const loadingDel = ref(false)
const editing = ref(false)
const deletedUser = ref(false)
const users = ref([])
const deletedUsers = ref([])

const targetUser = ref(null)

const showPassword1 = ref(false)
const showPassword2 = ref(false)
const confirmPass = ref('')
const onlyMiga = ref(false)
const isMiga = ref(false)
const searchWord = ref('')

const macrodistritos = ref([])
const zonas = ref([])
const ambitos = ref([])

// Verificar rol del perfil
const verifyUser = async () => {
  if (!token) return
  try {
    const res = await axios.get('https://normativa.miga.org.bo/api/usuarios/perfil', {
      headers: { Authorization: `Bearer ${token}` }
    })

  } catch (err) {
    error.value = 'Error al cargar perfil'
    localStorage.removeItem('token')
  }
}

// Cargar usuarios habilitados
const loadUsers = async () => {
  error.value = ''
  loading.value = true
  try {
    const res = await axios.get('https://normativa.miga.org.bo/api/usuarios-miga/todos', {
            headers: { Authorization: `Bearer ${token}` }
        })
    users.value = res.data
  } catch (err) {
    error.value = 'Error al cargar usuarios'
    handleError(err)
  } finally {
    loading.value = false
  }
}

// Cargar usuarios no habilitados
const loadDeleted = async () => {
  error.value = ''
  loadingDel.value = true
  try {
    const res = await axios.get('https://normativa.miga.org.bo/api/usuarios-miga/eliminados', {
            headers: { Authorization: `Bearer ${token}` }
        })
    deletedUsers.value = res.data
  } catch (err) {
    error.value = 'Error al cargar usuarios'
    handleError(err)
  } finally {
    loadingDel.value = false
  }
}


// Filtrar usuarios MIGA
const showOnlyMiga = async () => {
    if(onlyMiga.value){
        error.value = ''
        loading.value = true
        try {
            const res = await axios.get('https://normativa.miga.org.bo/api/usuarios-miga/solo-miga', {
            headers: { Authorization: `Bearer ${token}` }
        })
            users.value = res.data
        } catch (err) {
            error.value = 'Error al cargar usuarios'
        } finally {
            loading.value = false
        }
    } else {
        loadUsers()
    }
}

// Seleccionar usuario
const pickUser = async (u) => {
  Object.assign(user.value, u)
  user.value.macrodistrito_id = macrodistritos.value.find((macro) => macro.nombre === u.macrodistrito_nombre).id
  await waitForLoading()
  user.value.zona_id = zonas.value.find((zonas) => zonas.nombre_zona === u.nombre_zona).id
  user.value.ambitoactividad_id = ambitos.value.find((ambito) => ambito.nombre === u.ambito_nombre).id
  isMiga.value = user.value.rol === 'COMUNIDAD' ? false : true
  editing.value = true
  deletedUser.value = u.eliminado || false
  targetUser.value.scrollIntoView({ behavior: 'smooth' })
}

function waitForLoading() {
  return new Promise(resolve => {
    const interval = setInterval(() => {
      if (!loading.value) {
        clearInterval(interval)
        resolve()
      }
    }, 50)
  })
}

// Insertar usuario nuevo
const registerUser = async () => {
  error.value = ''
  loading.value = true
  try {
    const newData = {
      nombres: user.value.nombres,
      apellidop: user.value.apellidop,
      apellidom: user.value.apellidom,
      carnet_ci: user.value.carnet_ci,
      correo: user.value.correo === '' ? null : user.value.correo,
      macrodistrito_id: user.value.macrodistrito_id,
      zona_id: user.value.zona_id,
      ambitoactividad_id: user.value.ambitoactividad_id,
      contraseña: user.value.contraseña,
    }
    let response, message
    if(isMiga.value){
      if(user.value.contraseña !== confirmPass.value){
        error.value = 'Confirme la contraseña'
        return
      }
      
      response = await axios.post('https://normativa.miga.org.bo/api/usuarios-miga/registro-miga', newData, {
          headers: { Authorization: `Bearer ${token}` }
      })
      
      message = `${response.data.mensaje}: ${response.data.Usuario_defecto}.`

    } else {
      response = await axios.post('https://normativa.miga.org.bo/api/usuarios/registro-comunidad', newData, {
          headers: { Authorization: `Bearer ${token}` }
      })

      message = `${response.data.mensaje}: ${response.data.Usuario_defecto}. ${response.data.observacion}`
    }

    showSnackbar(message)
    loadUsers()
    resetForm()
  } catch (err) {
    handleError(err)
    if (err.response?.data?.detalles) {
      error.value = err.response.data.detalles.join(', ')
    }
  } finally {
    loading.value = false
  }
}

// Modificar usuario
const updateUser = async () => {
  error.value = ''
  loading.value = true
  try {
    const updatedData = {
      nombres: user.value.nombres,
      apellidop: user.value.apellidop,
      apellidom: user.value.apellidom,
      carnet_ci: user.value.carnet_ci,
      correo: user.value.correo,
      macrodistrito_id: user.value.macrodistrito_id,
      zona_id: user.value.zona_id,
      ambitoactividad_id: user.value.ambitoactividad_id,
      Usuario_defecto: user.value.Usuario_defecto
    }
    const response1 = await axios.patch(`https://normativa.miga.org.bo/api/usuarios/${user.value.id}`, updatedData, {
                            headers: { Authorization: `Bearer ${token}` }
                        })
    
    const newRol = {
        nuevoRol: isMiga.value ? 'MIGA' : 'COMUNIDAD'
    }
    const response2 = await axios.put(`https://normativa.miga.org.bo/api/usuarios-miga/${user.value.id}/rol`, newRol, {
                            headers: { Authorization: `Bearer ${token}` }
                        })
    
    showSnackbar('Usuario modificado exitosamente.')
    loadUsers()
    resetForm()
  } catch (err) {
    handleError(err)
  } finally {
    loading.value = false
  }
}

// Elimnar usuario
const deleteUser = async () => {
  try {
    await axios.put(`https://normativa.miga.org.bo/api/usuarios-miga/${user.value.id}/eliminar`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })

    showSnackbar('Usuario eliminado correctamente')
    deletedUser.value = true
    loadUsers()
    loadDeleted()
  } catch (err) {
    handleError(err)
  }
}

// Restaurar usuario
const restoreUser = async () => {
  try {
    await axios.put(`https://normativa.miga.org.bo/api/usuarios-miga/${user.value.id}/restaurar`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })

    showSnackbar('Usuario restaurado correctamente')
    deletedUser.value = true
    loadUsers()
    resetForm()
    loadDeleted()
  } catch (err) {
    handleError(err)
  }
}

// Restaurar usuario por ID
const restoreUserById = async (id) => {
  try {
    await axios.put(`https://normativa.miga.org.bo/api/usuarios-miga/${id}/restaurar`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })

    showSnackbar('Usuario restaurado correctamente')
    deletedUser.value = true
    loadUsers()
    resetForm()
    loadDeleted()
  } catch (err) {
    handleError(err)
  }
}

// Buscar usuarios
const searchUsers = async () => {
  onlyMiga.value = false

  if(!searchWord.value){
    loadUsers() 
    return
  }

  const regexes = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    username: /^[^.]+\.([^.]+)$/,
    id: /^\d+$/
  }

  if(regexes.email.test(searchWord.value) || regexes.username.test(searchWord.value) || regexes.id.test(searchWord.value)){
    loading.value = true
    try {
      const encodedWord = encodeURIComponent(searchWord.value)
      const url = `https://normativa.miga.org.bo/api/usuarios/buscar-identificador?valor=${encodedWord}`
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      })
      users.value = response.data

      if(users.value.length === 0){
          showSnackbar('Sin resultados de búsqueda.')
      }

    } catch (err) {
      error.value = 'Error al buscar usuarios'
      handleError(err)
    } finally {
      loading.value = false
    }
  } else {
    loading.value = true
    try {
      const encodedWord = encodeURIComponent(searchWord.value)
      const url = `https://normativa.miga.org.bo/api/usuarios/buscar-google?frase=${encodedWord}`
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      })
      users.value = response.data

      if(users.value.length === 0){
          showSnackbar('Sin resultados de búsqueda.')
      }

    } catch (err) {
      error.value = 'Error al buscar usuarios'
      handleError(err)
    } finally {
      loading.value = false
    }
  }
}

const loadMacros = async () => {
  try {
    const res = await axios.get("https://normativa.miga.org.bo/api/macrodistritos")

    macrodistritos.value = res.data

  } catch (error) {
    error.value = "Error al conectar con el servidor";
    handleError(error);
  }
}

watch(() => user.value.macrodistrito_id, async (newMacro) => {
  if (newMacro) {
    await loadZonas(newMacro)
    user.value.zona_id = null
  } else {
    zonas.value = []
  }
})

const loadZonas = async(idMacro) => {  
  loading.value = true

  try {
    const res = await axios.get(`https://normativa.miga.org.bo/api/macrodistrito/${idMacro}/zonas`)

    zonas.value = res.data

  } catch (error) {
    error.value = "Error al conectar con el servidor";
    handleError(error);
  } finally {
    loading.value = false
  }
}

const loadAmbitos = async() => {
  try {
    const res = await axios.get("https://normativa.miga.org.bo/api/ambitos")

    ambitos.value = res.data

  } catch (error) {
    error.value = "Error al conectar con el servidor";
    handleError(error);
  }
}

// Helpers
const resetForm = () => {
  user.value = {
    id: null,
    nombres: '',
    apellidop: '',
    apellidom: '',
    correo: '',
    contraseña: '',
    rol: 'MIGA'
  }
  editing.value = false
  deletedUser.value = false
}

const showSnackbar = (mensaje) => {
  snackbarContent.value = mensaje
  snackbar.value = true
}

const handleError = (err) => {
  if (err.response?.status === 401 || err.response?.status === 403) {
    error.value = 'No tienes permisos para esta acción'
    router.push('/login')
  } else if (err.response?.status === 400) {
    error.value = err.response.data.message || 'Datos inválidos'
  } else if (err.response?.status === 404) {
    error.value = 'Usuario no encontrado'
  } else {
    error.value = 'Error en el servidor'
  }
  console.error('Error:', err.response?.data || err.message)
}

onMounted(() => {
  verifyUser()
  loadUsers()
  loadDeleted()
  loadMacros()
  loadAmbitos()
})

</script>

<style scoped>
.v-container {
  background: linear-gradient(145deg, #f5f7fa, #e4e8f0);
  min-height: 100vh;
  padding: 2rem;
}

.v-card {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.input {
  padding: 10px;
}

.cursor-pointer {
  cursor: pointer;
  transition: background-color 0.2s;
}

.cursor-pointer:hover {
  background-color: #f5f5f5;
}

.gap-2 {
  gap: 8px;
}

.text-red {
  color: #ff5252;
  font-weight: 500;
}

.v-btn {
  font-weight: 500;
  letter-spacing: normal;
  text-transform: none;
}

</style>
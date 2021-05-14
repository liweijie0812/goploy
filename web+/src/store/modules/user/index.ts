import { Module, MutationTree, ActionTree } from 'vuex'
import { UserState } from './types'
import { RootState } from '../../types'
import { login, getInfo } from '@/api/user'
import { setLogin, logout } from '@/utils/auth'
import { getNamespace, setNamespace, setNamespaceList } from '@/utils/namespace'
import { resetRouter } from '@/router'

const state: UserState = {
  id: 0,
  account: '',
  name: '',
  superManager: 0,
}

const mutations: MutationTree<UserState> = {
  SET_ID: (state, id: number) => {
    state.id = id
  },
  SET_ACCOUNT: (state, account: string) => {
    state.account = account
  },
  SET_NAME: (state, name: string) => {
    state.name = name
  },
  SET_SUPER_MANAGER: (state, superManager: number) => {
    state.superManager = superManager
  },
}

const actions: ActionTree<UserState, RootState> = {
  // user login
  login(_, userInfo) {
    const { account, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ account: account.trim(), password: password })
        .then((response) => {
          const { data } = response

          let namespace = getNamespace()
          if (!namespace) {
            namespace = data.namespaceList[data.namespaceList.length - 1]
            setNamespace(namespace)
          }
          setNamespaceList(data.namespaceList)

          setLogin('ok')
          resolve(response)
        })
        .catch((error) => {
          reject(error)
        })
    })
  },

  // get user info
  getInfo({ commit }) {
    return new Promise((resolve, reject) => {
      getInfo()
        .then((response) => {
          const { data } = response
          if (!data) {
            reject('Verification failed, please Login again.')
          }
          const { id, account, name, superManager } = data.userInfo
          commit('SET_ID', id)
          commit('SET_ACCOUNT', account)
          commit('SET_NAME', name)
          commit('SET_SUPER_MANAGER', superManager)
          resolve(data)
        })
        .catch((error) => {
          reject(error)
        })
    })
  },

  // user logout
  logout({ commit }) {
    return new Promise((resolve) => {
      commit('SET_ID', 0)
      logout()
      resetRouter()
      resolve(null)
    })
  },
}

const setting: Module<UserState, RootState> = {
  namespaced: true,
  state,
  mutations,
  actions,
}

export default setting
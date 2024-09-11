import { Formik } from 'formik'
import * as Yup from 'yup'
import React from 'react'
import { Dimensions, LayoutAnimation, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native'
import PasswordStorage from '@/utils/password-storage'
import { authenticate } from '@/backends'
import { hslString } from '@/utils/colors'
import { getMargin } from '@/utils/dimensions'
import { fontSizeMultiplier } from '@/utils/dimensions'
import {
  textInputStyle,
  textLabelStyle,
  textInfoStyle,
  textInfoBoldStyle,
  textInfoItalicStyle
} from '@/utils/styles'
import InAppBrowser from 'react-native-inappbrowser-reborn'
import { supabase } from '@/storage/supabase'
import TextButton from './TextButton'

const services = {
  feedbin: 'https://feedbin.com',
  feedwrangler: 'https://feedwrangler.net',
  feedly: 'https://feedly.com'
}

const baseStyles = {
  fontFamily: 'IBMPlexMono',
  textAlign: 'left',
  color: hslString('rizzleText')
}

export const formElementStyles = {
  textInfoStyle: {
    ...baseStyles,
    fontFamily: 'IBMPlexSans',
    marginLeft: 20 * fontSizeMultiplier(),
    marginRight: 20 * fontSizeMultiplier(),
    marginTop: 40 * fontSizeMultiplier(),
    fontSize: 18 * fontSizeMultiplier()
  }
}

const width = Dimensions.get('window').width

class AccountCredentialsForm extends React.Component {
  constructor (props) {
    super(props)
    this.props = props
    this.state = {
      username: '',
      password: '',
      token: '', // readwise only
      isSubmitting: false,
      supabaseUser: undefined,
      showPasswordField: false,
      newPassword: ''
    }

    this.authenticateUser = this.authenticateUser.bind(this)
  }

  async authenticateUser ({username, password, email, token}, {setSubmitting, setErrors}) {
    const { service, setBackend, unsetBackend } = this.props
    if (service === 'reams') {
      // email = email.trim()
      // this.props.setSignInEmail(email)
      // await sendEmailLink(email)
      // console.log(`email: ${email}`)
    } else if (service === 'readwise') {
      setBackend('readwise', {
        accessToken: token
      })
      setSubmitting(false)
      this.setState({
        isAuthenticated: true
      })
    } else {
      const response = await authenticate({username, password}, service)
      console.log(response)
      if (response.status === 'success') {
        if (service === 'feedwrangler') {
          setBackend('feedwrangler', {
            accessToken: response.token
          })
        } else if (service === 'feedbin') {
          await PasswordStorage.setItem("feedbin_password", password)
          setBackend('feedbin', {
            username
          })
        }
        setSubmitting(false)
        this.setState({
          isAuthenticated: true
        })
      } else {
        setErrors({
          submit: 'Error: please check username and password'
        })
        setSubmitting(false)
        this.setState({
          isAuthenticated: false
        })
      }
    }
  }

  componentDidMount  = async () => {
    await this.componentDidUpdate()
  }

  componentDidUpdate = async () => {
    const supabaseUser = await supabase.auth.getUser()
    if (supabaseUser) {
      this.setState({supabaseUser: supabaseUser.data.user})
    }
  }

  render = () => {
    const { isActive, isExpanded, service, setBackend, unsetBackend, user } = this.props
    const serviceDisplay = service === 'basic' ?
      'Rizzle Basic' :
      service[0].toUpperCase() + service.slice(1)
    const initialValues = service === 'reams' ?
      { email: this.state.email } :
      service === 'readwise' ?
        { accessToken: this.state.token } :
        {
          username: this.state.username,
          password: this.state.password
        }
    let loggedInUserName
    switch (service) {
      case 'feedbin':
        loggedInUserName = user.backends.find(b => b.name === 'feedbin')?.username
        break
      case 'reams':
        loggedInUserName = user.email
        break
    }
    const validationSchemaShape = service === 'reams' ?
      Yup.object().shape({
        email: Yup.string().trim().email('That doesn’t look like a valid email...').required('Required')
      }) :
        service === 'readwise' ?
          Yup.object().shape({
            token: Yup.string().required('Required')
          }) :
          Yup.object().shape({
            username: Yup.string().required('Required'),
            password: Yup.string().required('Required')
          })

    const reamsText = (isWhite) => <Text 
      style={{
        ...textInfoStyle(isWhite ? 'white' : 'black'),
        marginBottom: getMargin()
      }}><Text style={textInfoBoldStyle(isWhite ? 'white' : 'black')}>Reams Basic</Text> is free, but it doesn’t sync with other devices or apps.</Text>
      
    const launchBrowser =  async (url) => {
      try {
        await InAppBrowser.isAvailable()
        InAppBrowser.open(url, {
          // iOS Properties
          dismissButtonStyle: 'close',
          preferredBarTintColor: hslString('rizzleBG'),
          preferredControlTintColor: hslString('rizzleText'),
          animated: true,
          modalEnabled: true,
          // modalPresentationStyle: "popover",
          // readerMode: true,
          // enableBarCollapsing: true,
        })
      } catch (error) {
        console.log('openLink', error)
      }
    }

    const isServiceExtra = (service) => service === 'readwise'

    const SubmitButton = ({ errors, handleSubmit, isSubmitting, isValid }) => {
      const errorsText = (
        <View style={{
          backgroundColor: hslString('logo2'),
          padding: 5,
          marginLeft: -16,
          marginRight: -16,
          marginBottom: -16,
          marginTop: 16,
        }}>
          <Text style={{
            ...textLabelStyle(),
            color: hslString('white'),
            textAlign: 'center'
          }}>{ errors.submit }</Text>
        </View>
      )
      return isSubmitting ?
        <Text style={{
          ...textLabelStyle(),
          marginTop: 12,
          marginBottom: 4,
          textAlign: 'center'
        }}>Submitting...</Text> :
        (<>
          <TouchableOpacity
            accessibilityLabel={`Authenticate with ${service[0].toUpperCase() + service.slice(1)}`}
            color={hslString('white')}
            disabled={isSubmitting || !isValid}
            onPress={handleSubmit}
            style={{
              alignSelf: 'center',
              marginTop: 5,
              marginBottom: 5
            }}
            testID={`${service}-submit-button`}
          >
            <Text style={{
              ...textInfoStyle('logo1'),
              textDecorationLine: 'underline'
            }}>Submit</Text>
          </TouchableOpacity>
          { errors?.submit && errorsText }
        </>)
    }
    
    return (
      <Formik
        enableReinitialize={true}
        initialValues={initialValues}
        isInitialValid={this.state.email || this.state.username || this.state.token ? true : false}
        onSubmit={this.authenticateUser}
        validationSchema={validationSchemaShape}
      >
        {({
          errors,
          handleChange,
          handleReset,
          handleSubmit,
          isSubmitting,
          isValid,
          submitCount,
          values
        }) => (
          <View style={{
            flex: 0,
            height: Platform.OS === 'web' ? undefined : 'auto',
          }}>
            { isActive ?
              <View style={{
                paddingTop: 16 * fontSizeMultiplier(),
                paddingBottom: 32 * fontSizeMultiplier(),
                marginTop: 16 * fontSizeMultiplier(),
                flex: 0,
                flexDirection: 'column',
                height: Platform.OS === 'web' ? undefined : 'auto',
                alignItems: 'stretch',
                justifyContent: 'space-between'
              }}>
                { service === 'basic' ?
                  <View style={{
                    marginLeft: -24 * fontSizeMultiplier(),
                    marginRight: -24 * fontSizeMultiplier()
                  }}>
                    { !!isActive && reamsText() }
                  </View> :
                  <React.Fragment>
                    { loggedInUserName &&
                      <View style={{
                        flexDirection: 'row',
                      }}>
                        <Text style={{
                          ...textInfoBoldStyle('white'),
                          textAlign: 'left',
                          flex: 1,
                        }}>Logged in as</Text>
                        <Text style={{
                          ...textInfoStyle('white'),
                          textAlign: 'right',
                          flex: 1,
                        }}>{ loggedInUserName }</Text>
                      </View>
                    }
                    <View style={{
                      alignSelf: 'stretch',
                      height: 1,
                      margin: getMargin(),
                      backgroundColor: 'rgba(255,255,255,0.2)'
                    }} />
                      { this.state.showPasswordField ? (
                      <View style={{
                        flexDirection: 'row',
                        marginRight: getMargin(),
                        flex: 1
                      }}>
                        <TextInput 
                          autoFocus={true}
                          onChangeText={(text) => this.setState({
                            newPassword: text
                          })}
                          style={{
                            ...textInfoStyle('white'),
                            flex: 1,
                            height: 24 * fontSizeMultiplier(),
                            borderBottomColor: 'white',
                            borderBottomWidth: 1
                          }}
                        />
                        <View style={{
                          flex: 0,
                          flexDirection: 'row',
                          width: 110
                        }}>
                          <TextButton
                            buttonStyle={{
                              flex: -1,
                              alignSelf: 'flex-end',
                              width: 50,
                              marginRight: 10
                            }}
                            isCompact
                            onPress={async () => {
                              const { data, error } = await supabase.auth.updateUser({
                                password: this.state.newPassword
                              })
                              console.log(data)
                              if (error) {
                                console.error(error)
                              }
                            }}
                            text='OK'
                          />
                          <TextButton
                            buttonStyle={{
                              flex: -1,
                              alignSelf: 'flex-end',
                              width: 50
                            }}
                            isCompact
                            onPress={async () => {
                              LayoutAnimation.configureNext({ 
                                duration: 500, 
                                create: { type: 'linear', property: 'opacity' }, 
                                update: { type: 'spring', springDamping: 0.9 }, 
                                delete: { duration: 100, type: 'linear', property: 'opacity' } 
                              })
                              this.setState({
                                showPasswordField: false
                              })
                            }}
                            text='Cancel'
                          />
                        </View>
                      </View>) : (
                      <View>
                        <View style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between'
                        }}>                      
                          <Text style={{
                            ...textInfoBoldStyle('white'),
                            textAlign: 'left',
                            flex: 1,
                          }}>Password</Text>
                          <View style={{
                            flex: 1,
                            marginRight: getMargin(),
                            justifyContent: 'center'
                          }}>
                            <TextButton
                              buttonStyle={{
                                flex: -1,
                                alignSelf: 'flex-end',
                                width: 50
                              }}
                              isCompact
                              onPress={async () => {
                                LayoutAnimation.configureNext({ 
                                  duration: 500, 
                                  create: { type: 'linear', property: 'opacity' }, 
                                  update: { type: 'spring', springDamping: 0.9 }, 
                                  delete: { duration: 100, type: 'linear', property: 'opacity' } 
                                })        
                                this.setState({
                                  showPasswordField: true
                                })
                              }}
                              text='Add'
                            />
                          </View>
                        </View>
                        <Text style={{
                          ...textInfoStyle('white'),
                          fontSize: 12 * fontSizeMultiplier(),
                          opacity: 0.8,
                          marginRight: 60
                        }}>You'll need to add a password if you want to use desktop browser extensions</Text>
                        </View>
                      )}
                      <View style={{
                        alignSelf: 'stretch',
                        height: 1,
                        margin: getMargin(),
                        backgroundColor: 'rgba(255,255,255,0.2)'
                      }} />
                    <View style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      // marginRight: getMargin()
                    }}>
                      <Text style={{
                        ...textInfoBoldStyle('white'),
                        flex: -1
                      }}>Email</Text>
                      <Text 
                        selectable
                        style={{
                          ...textInfoStyle('white'),
                          flex: 0,
                          textAlign: 'right'
                        }}>{ user.codeName }@feed.reams.app</Text>
                    </View>
                    <Text style={{
                      ...textInfoStyle('white'),
                      fontSize: 12 * fontSizeMultiplier(),
                      opacity: 0.8,
                      marginRight: 60,
                      marginTop: 3
                    }}>Use this email address to subscribe to newsletters</Text>
                    <View style={{
                        alignSelf: 'stretch',
                        height: 1,
                        margin: getMargin(),
                        backgroundColor: 'rgba(255,255,255,0.2)'
                      }} />
                    
                    <TouchableOpacity
                      accessibilityLabel={`Stop using ${serviceDisplay}`}
                      color={hslString('white')}
                      onPress={async () => {
                        if (service === 'feedbin') {
                          PasswordStorage.removeItem("feedbin_password")
                        }
                        if (service === 'reams') {
                          await supabase.auth.signOut()
                          // reams calls UNSET_BACKEND in the AuthProvider
                        } else {
                          unsetBackend(service) 
                        }
                      }}
                      style={{
                        marginTop: 16 * fontSizeMultiplier(),
                        width: '100%'
                      }}
                      testID={`${service}-logout-button`}
                    >
                      <Text style={{
                        ...textInfoStyle('white'),
                        textDecorationLine: 'underline',
                        textAlign: 'center'
                      }}>Stop using {serviceDisplay}</Text>
                    </TouchableOpacity>
                  </React.Fragment>
                }
              </View> :
              ( service === 'basic' ?
                <View style={{ marginTop: 20, marginBottom: 20 }}>
                  { reamsText(false) }
                  <TouchableOpacity
                      accessibilityLabel={'Use Reams Basic'}
                      color={hslString('white')}
                      onPress={ () => {
                        LayoutAnimation.configureNext({ 
                          duration: 500, 
                          create: { type: 'linear', property: 'opacity' }, 
                          update: { type: 'spring', springDamping: 0.4 }, 
                          delete: { duration: 100, type: 'linear', property: 'opacity' } 
                        })
                        setBackend('basic')
                        // LayoutAnimation.configureNext(LayoutAnimation.Presets.spring)
                        this.setState({
                          isAuthenticated: true
                        })
                      }}
                      style={{
                        alignSelf: 'center',
                        marginTop: 5,
                        marginBottom: 5
                      }}
                    >
                      <Text style={{
                        ...textInfoStyle('logo1'),
                        textDecorationLine: 'underline'
                      }}>Use Reams Basic</Text>
                    </TouchableOpacity>
                </View> :
                service === 'readwise' ? (
                  <View style={{
                    paddingVertical: 16 * fontSizeMultiplier(),
                    marginHorizontal: 16 * fontSizeMultiplier(),
                    alignItems: 'center',
                  }}>
                    <TouchableOpacity onPress={ () => launchBrowser('https://readwise.io/access_token') }>
                      <Text style={{
                          ...textInfoStyle('logo1'),
                          textDecorationLine: 'underline'
                        }}>Log in to Readwise</Text>
                    </TouchableOpacity>
                    <Text style={{
                      ...textInfoItalicStyle(),
                      margin: 16 * fontSizeMultiplier(),
                      padding: 0
                    }}>... and then enter the token below:</Text>
                    <View style={{ 
                      flex: 1,
                      width: '100%' 
                    }}>
                      <TextInput
                        onChangeText={handleChange('token')}
                        style={{
                          ...textInputStyle(),
                          width: '100%'
                        }}
                        testID={`${service}-token-text-input`}
                        value={values.token}
                      />
                      <Text style={textLabelStyle()}>Token</Text>
                    </View>
                    <SubmitButton 
                      errors={errors} 
                      handleSubmit={handleSubmit}
                      isSubmitting={isSubmitting}
                      isValid={isValid}
                    />
                  </View>
                ): (
                <View style={{
                  paddingTop: 16,
                  paddingLeft: 16,
                  paddingRight: 16,
                  marginTop: 16,
                  marginBottom: 16
                }}>
                  <TextInput
                    autoCapitalize='none'
                    keyboardType='email-address'
                    onChangeText={handleChange('username')}
                    style={textInputStyle()}
                    testID={`${service}-username-text-input`}
                    value={values.username}
                  />
                  <Text style={textLabelStyle()}>User name</Text>
                  <View style={{
                    position: 'relative',
                    height: 48
                  }}>
                    <TextInput
                      onChangeText={handleChange('password')}
                      secureTextEntry={true}
                      style={{
                        ...textInputStyle(),
                        marginTop: 24
                      }}
                      testID={`${service}-password-text-input`}
                      value={values.password}
                    />
                  </View>
                  <Text style={textLabelStyle()}>Password</Text>
                  <SubmitButton 
                    errors={errors} 
                    handleSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    isValid={isValid}
                  />
                </View>
              ))
            }
          </View>
        )}
      </Formik>
    )
  }
}

export default AccountCredentialsForm
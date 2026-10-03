import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { LogoBadge } from '@/components/logo';
import TextField from '@/components/text-field';
import Button from '@/components/button';
import Icon, { IconName } from '@/components/icon';
import { Usuario } from '@/@types/usuario';
import { Colors } from '@/constants/colors';
import { Fonts, Radius, Shadow, Spacing, Type } from '@/constants/theme';

type Aba = 'login' | 'cadastro';

export default function LoginCadastro() {
    const { isAuthenticated, isAdmin, isLoading, signIn, signUp } = useAuth();
    const { showToast } = useToast();
    const { isMd } = useBreakpoint();
    const [aba, setAba] = useState<Aba>('login');

    // login
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [lembrar, setLembrar] = useState(true);

    // cadastro
    const [nome, setNome] = useState('');
    const [emailCadastro, setEmailCadastro] = useState('');
    const [senhaCadastro, setSenhaCadastro] = useState('');
    const [confirmar, setConfirmar] = useState('');

    const [erro, setErro] = useState('');
    const [enviando, setEnviando] = useState(false);

    if (isLoading) {
        return (
            <View style={styles.carregando}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    // Já tem cookie válido: vai direto para a área certa
    if (isAuthenticated && !enviando) {
        return <Redirect href={isAdmin ? '/painel' : '/explorar'} />;
    }

    function trocarAba(nova: Aba) {
        setAba(nova);
        setErro('');
    }

    function entrarNaArea(u: Usuario) {
        if (u.roles.includes('ADMIN')) {
            showToast({ titulo: 'Conexão confirmada!', descricao: 'Perfil ADMIN detectado. Abrindo o Painel...', icone: 'analytics' });
            router.replace('/painel');
        } else {
            showToast({ titulo: 'Conexão confirmada!', descricao: 'Perfil CLIENTE ativo. Bem-vindo(a) de volta!' });
            router.replace('/explorar');
        }
    }

    async function handleLogin() {
        setErro('');
        setEnviando(true);
        const r = await signIn(email, senha, lembrar);
        setEnviando(false);
        if (r.ok && r.usuario) entrarNaArea(r.usuario);
        else setErro(r.error ?? 'Não foi possível entrar.');
    }

    async function handleCadastro() {
        setErro('');
        if (!nome.trim() || !emailCadastro.trim() || !senhaCadastro) {
            setErro('Preencha todos os campos.');
            return;
        }
        if (senhaCadastro.length < 6) {
            setErro('A senha deve ter no mínimo 6 caracteres.');
            return;
        }
        if (senhaCadastro !== confirmar) {
            setErro('As senhas informadas não coincidem.');
            return;
        }
        setEnviando(true);
        const r = await signUp(nome, emailCadastro, senhaCadastro);
        setEnviando(false);
        if (r.ok && r.usuario) {
            showToast({ titulo: `Seja bem-vindo(a), ${r.usuario.nome}!`, descricao: 'Conta criada com sucesso.', icone: 'celebration' });
            router.replace('/explorar');
        } else {
            setErro(r.error ?? 'Não foi possível criar a conta.');
        }
    }

    return (
        <View style={styles.tela}>
            <Decoracao />
            <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
                <View style={styles.card}>
                    {/* Marca + seletor de abas */}
                    <View style={[styles.topo, !isMd && styles.topoMobile]}>
                        <View style={styles.marca}>
                            <LogoBadge size={44} />
                            <Text style={styles.marcaNome}>Muuv</Text>
                        </View>
                        <Text style={styles.tagline}>
                            A plataforma de apoio coletivo feita com gentileza, transparência e acolhimento mútuo.
                        </Text>
                        <View style={styles.abas}>
                            <AbaBotao icone="login" texto="Entrar" ativa={aba === 'login'} onPress={() => trocarAba('login')} />
                            <AbaBotao icone="person-add" texto="Criar Conta" ativa={aba === 'cadastro'} onPress={() => trocarAba('cadastro')} />
                        </View>
                    </View>

                    <View style={[styles.formulario, !isMd && styles.formularioMobile]}>
                        {aba === 'login' ? (
                            <View style={styles.campos}>
                                <TextField
                                    label="E-mail"
                                    icone="mail"
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="Digite seu e-mail"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                />
                                <TextField
                                    label="Senha de Acesso"
                                    icone="lock"
                                    value={senha}
                                    onChangeText={setSenha}
                                    placeholder="Digite sua senha"
                                    secureTextEntry={!mostrarSenha}
                                    autoCapitalize="none"
                                    onSubmitEditing={handleLogin}
                                    direita={
                                        <Pressable
                                            onPress={() => setMostrarSenha(v => !v)}
                                            accessibilityLabel="Alternar visibilidade da senha"
                                            style={styles.olho}
                                        >
                                            <Icon name={mostrarSenha ? 'visibility-off' : 'visibility'} size={20} color={Colors.outline} />
                                        </Pressable>
                                    }
                                />
                                <Pressable style={styles.lembrar} onPress={() => setLembrar(v => !v)} accessibilityRole="checkbox"
                                           accessibilityState={{ checked: lembrar }}>
                                    <View style={[styles.checkbox, lembrar && styles.checkboxMarcado]}>
                                        {lembrar ? <Icon name="check" size={16} color={Colors.onPrimary} /> : null}
                                    </View>
                                    <Text style={styles.lembrarTexto}>Lembrar de mim neste dispositivo</Text>
                                </Pressable>

                                {erro ? <ErroBox mensagem={erro} /> : null}

                                <Button
                                    title="Entrar"
                                    iconeDireita="arrow-forward"
                                    onPress={handleLogin}
                                    loading={enviando}
                                    style={styles.botao}
                                />
                                <Rodape texto="Ainda não tem conta?" link="Cadastre-se" onPress={() => trocarAba('cadastro')} />
                            </View>
                        ) : (
                            <View style={[styles.campos, { gap: 14 }]}>
                                <TextField
                                    label="Nome de Usuário"
                                    icone="badge"
                                    value={nome}
                                    onChangeText={setNome}
                                    placeholder="Digite seu nome"
                                    autoComplete="name"
                                />
                                <TextField
                                    label="E-mail"
                                    icone="mail"
                                    value={emailCadastro}
                                    onChangeText={setEmailCadastro}
                                    placeholder="Digite seu e-mail"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                                <View style={[styles.senhas, isMd && styles.senhasLado]}>
                                    <TextField
                                        label="Senha"
                                        icone="lock"
                                        value={senhaCadastro}
                                        onChangeText={setSenhaCadastro}
                                        placeholder="Mínimo 6 dígitos"
                                        secureTextEntry
                                        autoCapitalize="none"
                                        containerStyle={styles.senhaCampo}
                                    />
                                    <TextField
                                        label="Confirmar Senha"
                                        icone="verified-user"
                                        value={confirmar}
                                        onChangeText={setConfirmar}
                                        placeholder="Repita sua senha"
                                        secureTextEntry
                                        autoCapitalize="none"
                                        containerStyle={styles.senhaCampo}
                                        onSubmitEditing={handleCadastro}
                                    />
                                </View>

                                {erro ? <ErroBox mensagem={erro} /> : null}

                                <Button
                                    title="Criar Conta"
                                    iconeDireita="arrow-forward"
                                    onPress={handleCadastro}
                                    loading={enviando}
                                    style={styles.botao}
                                />
                                <Rodape texto="Já possui uma conta?" link="Entrar agora" onPress={() => trocarAba('login')} />
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

function AbaBotao({ icone, texto, ativa, onPress }: { icone: IconName; texto: string; ativa: boolean; onPress: () => void }) {
    return (
        <Pressable
            onPress={onPress}
            style={[styles.aba, ativa && styles.abaAtiva]}
            accessibilityRole="tab"
            accessibilityState={{ selected: ativa }}
        >
            <Icon name={icone} size={19} color={ativa ? Colors.primary : Colors.onSurfaceVariant} />
            <Text style={[styles.abaTexto, ativa && { color: Colors.primary }]}>{texto}</Text>
        </Pressable>
    );
}

function ErroBox({ mensagem }: { mensagem: string }) {
    return (
        <View style={styles.erro}>
            <Icon name="error" size={18} color={Colors.onErrorContainer} />
            <Text style={styles.erroTexto}>{mensagem}</Text>
        </View>
    );
}

function Rodape({ texto, link, onPress }: { texto: string; link: string; onPress: () => void }) {
    return (
        <View style={styles.rodape}>
            <Text style={styles.rodapeTexto}>{texto} </Text>
            <Pressable onPress={onPress}>
                <Text style={styles.rodapeLink}>{link}</Text>
            </Pressable>
        </View>
    );
}

/** Manchas orgânicas de fundo (os "blobs" do mockup). */
function Decoracao() {
    return (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            <View style={[styles.blob, { top: -96, left: -80, width: 384, height: 384, backgroundColor: 'rgba(180, 242, 179, 0.25)' }]} />
            <View style={[styles.blob, { top: '33%', right: -96, width: 320, height: 320, backgroundColor: 'rgba(255, 219, 205, 0.35)' }]} />
            <View style={[styles.blob, { bottom: -80, left: '25%', width: 384, height: 320, backgroundColor: 'rgba(188, 239, 190, 0.3)' }]} />
            <Svg width={112} height={112} viewBox="0 0 100 100" style={{ position: 'absolute', top: 48, left: 40, transform: [{ rotate: '-12deg' }] }}>
                <Path d="M22,34 C12,48 10,70 30,82 C50,94 78,88 88,72 C98,56 86,30 70,18 C54,6 32,20 22,34 Z"
                      fill={Colors.surfaceContainerHigh} opacity={0.6} />
            </Svg>
            <Svg width={144} height={144} viewBox="0 0 100 100" style={{ position: 'absolute', bottom: 64, right: 48, transform: [{ rotate: '45deg' }] }}>
                <Path d="M18,45 C8,62 16,86 42,91 C68,96 85,81 92,60 C99,39 88,14 62,8 C36,2 28,28 18,45 Z"
                      fill={Colors.surfaceContainerHigh} opacity={0.5} />
            </Svg>
        </View>
    );
}

const styles = StyleSheet.create({
    carregando: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surface },
    tela: { flex: 1, backgroundColor: Colors.surface, overflow: 'hidden' },
    scroll: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.gutter },
    blob: { position: 'absolute', borderRadius: Radius.full, filter: 'blur(48px)' },
    card: {
        width: '100%',
        maxWidth: 520,
        backgroundColor: Colors.surfaceContainerLowest,
        borderRadius: Radius.xxxl,
        overflow: 'hidden',
        ...Shadow.xl,
    },
    topo: {
        paddingTop: 32,
        paddingBottom: Spacing.md,
        paddingHorizontal: 32,
        alignItems: 'center',
        backgroundColor: 'rgba(247, 243, 239, 0.7)',
    },
    topoMobile: { paddingHorizontal: Spacing.lg },
    marca: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    marcaNome: { ...Type.headlineMd, color: Colors.onSurface },
    tagline: { ...Type.bodySm, color: Colors.onSurfaceVariant, textAlign: 'center', maxWidth: 384 },
    abas: {
        marginTop: Spacing.lg,
        width: '100%',
        padding: 6,
        backgroundColor: Colors.surfaceContainer,
        borderRadius: Radius.xxl,
        flexDirection: 'row',
        boxShadow: 'inset 0px 2px 4px rgba(28, 27, 26, 0.05)',
    },
    aba: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        borderRadius: Radius.xl,
    },
    abaAtiva: { backgroundColor: Colors.surfaceContainerLowest, ...Shadow.sm },
    abaTexto: { ...Type.labelLg, color: Colors.onSurfaceVariant },
    formulario: { paddingHorizontal: 32, paddingBottom: 32, paddingTop: Spacing.sm },
    formularioMobile: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
    campos: { gap: Spacing.md },
    olho: { padding: 4, marginLeft: 6 },
    lembrar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 4, alignSelf: 'flex-start' },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 6,
        backgroundColor: Colors.surfaceContainer,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxMarcado: { backgroundColor: Colors.primary },
    lembrarTexto: { ...Type.bodySm, color: Colors.onSurfaceVariant },
    erro: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: Colors.errorContainer,
        borderRadius: Radius.xl,
        padding: 12,
    },
    erroTexto: { ...Type.bodySm, fontFamily: Fonts.medium, color: Colors.onErrorContainer, flex: 1 },
    botao: { marginTop: Spacing.sm, paddingVertical: 14, borderRadius: Radius.xxl },
    senhas: { gap: 14 },
    senhasLado: { flexDirection: 'row', gap: 12 },
    senhaCampo: { flex: 1 },
    rodape: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', marginTop: Spacing.sm },
    rodapeTexto: { ...Type.bodySm, color: Colors.onSurfaceVariant },
    rodapeLink: { ...Type.labelLg, color: Colors.primary, marginLeft: 4 },
});

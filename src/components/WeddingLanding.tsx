import { ActionIcon, Box, Button, Card, Container, Divider, Group, Image, Overlay, SimpleGrid, Text, Title } from '@mantine/core';
import { IconChevronDown, IconGift, IconHeart, IconMapPin, IconShare, IconUsers } from '@tabler/icons-react';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useEffect, useState } from 'react';
import classes from './HeroContent.module.css';
dayjs.extend(relativeTime);
dayjs.locale('pt-br');

function Countdown({ date, time }: { date: string, time?: string }) {
  const [diff, setDiff] = useState('');
  const [target, setTarget] = useState<Date | null>(null);
  useEffect(() => {
    if (!date) return;
    let dateTime = date;
    console.log('Date:', date, 'Time:', time);
    if (time) dateTime += 'T' + time;
    setTarget(new Date(dateTime));
  }, [date, time]);
  useEffect(() => {
    if (!target) return;
    const update = () => {
      const now = new Date();
      const diffMs = target.getTime() - now.getTime();
      if (diffMs <= 0) {
        setDiff('O grande dia chegou!');
        return;
      }
      const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const horas = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
      const minutos = Math.floor((diffMs / (1000 * 60)) % 60);
      const segundos = Math.floor((diffMs / 1000) % 60);
      setDiff(`Faltam apenas ${dias} dias, ${horas}h ${minutos}m ${segundos}s para o grande dia.`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [target]);
  return <Title order={2} size={24} mb={8} style={{ textAlign: 'center' }} weight={700}>{diff}</Title>;
}

export default function WeddingLanding({ data }: { data: any }) {
  console.log('Dados do site:', data);
  // Ajusta para ler dados do modelo WeddingSite (sem content)
  const theme = data.template || 'classico';
  const casal = `${data.groom_name || ''} & ${data.bride_name || ''}`;
  const dataCasamento = data.wedding_date ? dayjs(data.wedding_date).format('YYYY-MM-DD') : '';
  const horaCasamento = data.wedding_time || '00:00';
  const local = data.local;
  const aboutUs = data.about_us;
  const rsvpText = data.rsvp_text;
  const gallery = data.gallery || [];
  const palette = data.palette;
  const font = data.font;
  const countdown = data.countdown;
  const map = data.map;
  const social = data.social;
  const coverPhoto = data.cover_photo;
  const frase = data.frase || '';
  const listaPresentes = data.lista_presentes || [];
  const contato = data.contato || '';
  const visits = data.visits || 0;

  const showCountdown = countdown !== false && dataCasamento;
  const [showGallery, setShowGallery] = useState(false);

  // Temas: classico, moderninho, rustico
  const themeStyles = {
    classico: {
      bg: palette === 'rosa' ? '#fff0f6' : palette === 'dourado' ? '#fffbe6' : '#f8f9fa',
      titleColor: 'pink.7',
      accent: 'pink.7',
    },
    moderninho: {
      bg: palette === 'azul' ? '#e3f2fd' : palette === 'verde' ? '#e8f5e9' : '#f3e5f5',
      titleColor: 'blue.7',
      accent: 'blue.7',
    },
    rustico: {
      bg: palette === 'marfim' ? '#f5f5dc' : palette === 'laranja' ? '#fff3e0' : '#efebe9',
      titleColor: 'orange.8',
      accent: 'orange.8',
    },
  };
  const style = themeStyles[theme] || themeStyles.classico;

  return (
    <Box style={{ fontFamily: font || 'inherit', background: style.bg, minHeight: '100vh', transition: 'background 0.6s' }}>
      {/* HERO */}
      {
        coverPhoto && coverPhoto.url && (
          <Box className={classes.hero}
            style={{ backgroundImage: `url(${coverPhoto.url})`, position: 'relative', backgroundSize: 'cover', backgroundPosition: 'center' }}
          >
            <Overlay
              gradient="linear-gradient(180deg, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, .65) 40%)"
              opacity={1}
              zIndex={0}
            />
            <Container className={classes.container} size="md">
              <Title className={classes.title}>{casal}</Title>
              <Text className={classes.description} size="xl" mt="xl">
                {dayjs(dataCasamento).format('DD [de] MMMM [de] YYYY')}
              </Text>
            </Container>
          </Box>
        )
      }
      {
        !coverPhoto && (
          <Container py={60} style={{ textAlign: 'center', position: 'relative' }}>
            <Title order={1} size={48} c={style.titleColor} style={{ letterSpacing: 2, textShadow: '0 2px 16px #0001', textAlign: 'center' }}>{casal}</Title>
            <Text size="lg" mt={8} style={{ textAlign: 'center' }}>
              {data.wedding_date ? dayjs(data.wedding_date).format('DD [de] MMMM [de] YYYY') : ''}
            </Text>
            <ActionIcon mb={16} mt={24} size="xl" color={style.accent} variant="light" onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })} style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: -32, zIndex: 2 }}>
              <IconChevronDown size={32} />
            </ActionIcon>
          </Container>
        )
      }

      <Divider my={32} />
      {/* QUEM SOMOS */}
      {
        aboutUs && (
          <>
            <Container size="sm" py={32} style={{ textAlign: 'center' }}>
              <Title order={2} size={32} mb={8} c={style.accent} style={{ textAlign: 'center' }}>Nossa História</Title>
              <Text size="lg" style={{ textAlign: 'center' }}>{aboutUs}</Text>
            </Container>
            <Divider my={32} />
          </>
        )}
      {/* GALERIA */}
      {gallery.length > 0 && (
        <>
          <Container py={32} style={{ textAlign: 'center' }}>
            <Title order={2} size={32} mb={8} c={style.accent} style={{ textAlign: 'center' }}>Galeria</Title>
            <Button variant="light" color={style.accent} size="sm" mb={16} onClick={() => setShowGallery(v => !v)}>
              {showGallery ? 'Ocultar Galeria' : 'Ver Galeria'}
            </Button>
            {showGallery && (
              <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
                {gallery.map((photo: any, i: number) => (
                  <Image key={i} src={photo.url} alt={`Foto ${i + 1}`} radius="md" height={160} fit="cover" style={{ boxShadow: '0 2px 16px #0002' }} />
                ))}
              </SimpleGrid>
            )}
          </Container>
          <Divider my={32} />
        </>
      )}
      {/* FRASE DO CASAL */}
      {frase && (
        <>
          <Container size="sm" style={{ textAlign: 'center' }}>
            <Text size="xl" c={style.accent} style={{ fontStyle: 'italic', textAlign: 'center' }}>
              <IconHeart size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} />
              {frase}
            </Text>
          </Container>
          <Divider my={32} />
        </>
      )}
      {/* CONTADOR REGRESSIVO DESTAQUE */}
      {showCountdown && (
        <>
          <Container style={{ textAlign: 'center' }}>
            <Countdown date={dataCasamento} time={horaCasamento} />
          </Container>
          <Divider my={32} />
        </>
      )}
      {/* LOCAL DO EVENTO */}
      <Container size="sm" py={32} style={{ textAlign: 'center' }}>
        <Title order={2} size={32} mb={8} c={style.accent} style={{ textAlign: 'center' }}>Local do Evento</Title>
        <Group style={{ justifyContent: 'center', marginBottom: 16 }}><IconMapPin size={24} /><Text size="lg">{local}</Text></Group>
        {map && data.latitude && data.longitude && (
          <>
            <Box style={{ width: '100%', height: 300, margin: '0 auto', borderRadius: 12, overflow: 'hidden' }}>
              <iframe
                title="Mapa do Evento"
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${data.longitude - 0.005}%2C${data.latitude - 0.003}%2C${data.longitude + 0.005}%2C${data.latitude + 0.003}&layer=mapnik&marker=${data.latitude}%2C${data.longitude}`}
                allowFullScreen
              ></iframe>
            </Box>
            <Text size="lg" style={{ textAlign: 'center', marginBottom: 8 }}>
              {data.address}
              {data.number ? `, ${data.number}` : ''}
              {data.district ? ` - ${data.district}` : ''}
              {data.city ? `, ${data.city}` : ''}
              {data.state ? ` - ${data.state}` : ''}
              {data.postalcode ? `, CEP: ${data.postalcode}` : ''}
            </Text>
          </>

        )}
      </Container>
      <Divider my={32} />
      {/* RSVP */}
      <Container size="sm" py={32} style={{ textAlign: 'center' }}>
        <Title order={2} size={32} mb={8} c={style.accent} style={{ textAlign: 'center' }}>Confirme sua presença</Title>
        <Text size="lg" style={{ textAlign: 'center' }}>{rsvpText || 'Em breve formulário de RSVP.'}</Text>
      </Container>
      <Divider my={32} />
      {/* LISTA DE PRESENTES */}
      {listaPresentes.length > 0 && (
        <>
          <Container size="sm" py={32} style={{ textAlign: 'center' }}>
            <Title order={2} size={32} mb={8} c={style.accent} style={{ textAlign: 'center' }}>Lista de Presentes</Title>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              {listaPresentes.map((item: any, i: number) => (
                <Card key={i} shadow="sm" p="md" radius="md" withBorder>
                  <Group style={{ justifyContent: 'center' }}>
                    <IconGift size={24} />
                    <Text size="lg">{item.nome}</Text>
                    {item.url && <Button component="a" href={item.url} target="_blank" size="xs" ml="auto">Ver</Button>}
                  </Group>
                </Card>
              ))}
            </SimpleGrid>
          </Container>
          <Divider my={32} />
        </>
      )}
      {/* CONTATO */}
      <Container size="sm" py={32} style={{ textAlign: 'center' }}>
        <Title order={2} size={32} mb={8} c={style.accent} style={{ textAlign: 'center' }}>Contato</Title>
        <Text size="lg" style={{ textAlign: 'center' }}>{contato}</Text>
      </Container>
      {/* FOOTER */}
      <Container size="sm" py={32}>
        <Group style={{ justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Text size="sm" c="dimmed" style={{ flex: 1, textAlign: 'left' }}>
            Site criado com marriplan.com
          </Text>

          <Group gap={1} style={{ flex: 1, display: 'flex', alignItems: 'center' }} w="100%">
            <IconUsers size={16} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            <Text size="sm" c="dimmed">
              {visits || 0} pessoas visitaram
            </Text>
          </Group>

          <Group gap={4} style={{ flex: 1, justifyContent: 'flex-end', display: 'flex', alignItems: 'center' }}>
            <Text size="sm" c="dimmed">
              Compartilhar
            </Text>
            <ActionIcon
              color={style.accent}
              variant="light"
              size="lg"
              onClick={() =>
                navigator.share &&
                navigator.share({ title: casal, url: window.location.href })
              }
            >
              <IconShare size={20} />
            </ActionIcon>
          </Group>
        </Group>
      </Container>
    </Box >
  );
}

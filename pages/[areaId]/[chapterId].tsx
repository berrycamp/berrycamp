import {NavigateBefore, NavigateNext} from "@mui/icons-material";
import {Box, Breadcrumbs, Button, Card, CardActionArea, CardMedia, Container, Divider, ImageListItemBar, Link as MuiLink, List, ListItemButton, Tab, Tabs, Typography} from "@mui/material";
import {DATA} from "logic/data/data";
import {getImageURL} from "logic/fetch/image";
import {pluralize} from "logic/utils/pluralize";
import {Layout} from "modules/layout/Layout";
import Image from "next/image";
import Link from "next/link";
import {GetStaticPaths, GetStaticProps} from "next/types";
import {AppNextPage} from "pages/_app";
import {ParsedUrlQuery} from "querystring";
import {FC, Fragment, useState} from "react";
import {Area, Chapter, Room, Side} from "../../logic/data/dataTree";

const ChapterPage: AppNextPage<ChapterProps> = ({areaId, area, chapterId, chapter, mode, toggleMode, view, setView}) => {
  const [showSubrooms, setShowSubrooms] = useState<boolean>(true);

  const [sideId, setSideId] = useState<"a" | "b" | "c">("a");

  const roomCount: number | undefined = chapter.sides[sideId]?.roomCount;

  const chapterKeys: string[] = Object.keys(area.chapters);
  const prevChapterId: string | undefined = chapterKeys[chapterKeys.indexOf(chapterId) - 1];
  const prevChapter: Chapter | undefined = prevChapterId ? area.chapters[prevChapterId] : undefined;
  const nextChapterId: string | undefined = chapterKeys[chapterKeys.indexOf(chapterId) + 1];
  const nextChapter: Chapter | undefined = nextChapterId ? area.chapters[nextChapterId] : undefined;

  const side: Side | undefined = chapter.sides[sideId];

  return (
    <Layout
      title={chapter.name}
      description={chapter.desc}
      imgUrl={chapter.image}
      mode={mode}
      toggleMode={toggleMode}
      view={view}
      setView={setView}
    >
      <Container>
        <Breadcrumbs sx={{marginTop: 2}}>
          <MuiLink href={`/${areaId}`} underline="always">
            {area.name}
          </MuiLink>
          <Typography color="text.primary">{chapter.name}</Typography>
        </Breadcrumbs>
        <Box display="flex" alignItems="center" paddingTop={2} paddingBottom={2}>
          <Box flexShrink={0} position="relative" width={240} height={135}>
            <Image
              unoptimized
              className="pixelated-image"
              src={getImageURL(chapter.image)}
              alt={`Image of chapter ${chapter.name}`}
              width={240}
              height={135}
            />
          </Box>
          <Box marginLeft={2}>
            <Typography component="div" variant="h4">{`${chapter.chapterNo ? `Chapter ${chapter.chapterNo} - ` : ""}${chapter.name}`}</Typography>
            <Typography component="div" color="text.secondary">{chapter.gameId}</Typography>
            <Typography component="div" color="text.secondary" marginTop={2}>{chapter.desc}</Typography>
          </Box>
        </Box>
        <Box display="flex" justifyContent="space-between">
          <Box>
            {prevChapter && prevChapterId && (
              <Link passHref href={`/${areaId}/${prevChapterId}`}>
                <Button
                  size="small"
                  variant="outlined"
                  endIcon={<NavigateBefore />}
                  aria-label={`Go to previous chapter ${prevChapter.name}`}
                >
                  {prevChapter.name}
                </Button>
              </Link>
            )}
          </Box>
          <Box>
            {nextChapter && nextChapterId && (
              <Link passHref href={`/${areaId}/${nextChapterId}`}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<NavigateNext />}
                  aria-label={`Go to previous chapter ${nextChapter.name}`}
                >
                  {nextChapter.name}
                </Button>
              </Link>
            )}
          </Box>
        </Box>
        <Tabs variant="fullWidth" value={sideId} onChange={(_, value) => setSideId(value)}>
          {Object.entries(chapter.sides).map(([sideKey, side]) => (
            <Tab key={side.name} value={sideKey} label={`${side.name}-side`} />
          ))}
        </Tabs>
        {roomCount && (
          <Typography component="div" variant="body1" color="text.secondary" marginTop={2} textAlign="center">
            {pluralize(roomCount, "room")}
          </Typography>
        )}
        {side && (
          <Fragment>
            {view === "grid" ? (
              <GridChapterView areaId={areaId} chapterId={chapterId} sideId={sideId} side={side} showSubrooms={showSubrooms} />
            ) : (view === "list") && (
              <ListChapterView areaId={areaId} chapterId={chapterId} sideId={sideId} side={side} showSubrooms={showSubrooms} />
            )}
          </Fragment>
        )}
      </Container>
    </Layout>
  )
}


interface ViewProps {
  areaId: string;
  chapterId: string;
  sideId: "a" | "b" | "c";
  side: Side;
  showSubrooms: boolean;
}

interface ViewItemProps {
  roomId: string;
  roomName: string;
  href: string,
  image: string
}

const GridChapterView: FC<ViewProps> = ({areaId, chapterId, sideId, side, showSubrooms}) => {
  return (
    <Fragment>
      {side.checkpoints.map((checkpoint, checkpointIndex) => (
        <Box key={checkpoint.name} sx={{display: "flex", flexDirection: "column", marginTop: 2, marginBottom: 2, padding: 0}}>
          <Typography component="div" variant="h5" color="text.secondary" alignSelf="center">
            {checkpointIndex + 1}. {checkpoint.name}
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1} paddingTop={2} paddingBottom={2} justifyContent="center">
            {checkpoint.roomOrder.map(roomId => {
              const room: Room | undefined = side.rooms[roomId];
              if (room === undefined) {
                return undefined;
              }

              return (
                <Fragment key={roomId}>
                  {showSubrooms && room.subrooms ? room.subrooms.map((subroom, subroomIndex) => (
                    <GridChapterItem
                      key={subroomIndex}
                      roomId={roomId}
                      roomName={subroom.name}
                      image={subroom.image}
                      href={`/${areaId}/${chapterId}/${sideId}/${roomId}/${subroomIndex + 1}`}
                    />
                  )) : (
                    <GridChapterItem
                      key={roomId}
                      roomId={roomId}
                      roomName={room.name}
                      image={room.image}
                      href={`/${areaId}/${chapterId}/${sideId}/${roomId}`}
                    />
                  )}
                </Fragment>
              )
            })}
          </Box>
          <Divider flexItem />
        </Box>
      ))}
    </Fragment>
  );
}

const GridChapterItem: FC<ViewItemProps> = ({roomId, roomName, href, image}) => {
  const [hover, setHover] = useState<boolean>(false);

  return (
    <Card sx={{width: 320, height: 180}}>
      <CardActionArea
        className="pixelated-image"
        sx={{flexGrow: 1, flexDirection: "column", alignItems: "stretch", height: "100%"}}
        href={href}
        onMouseOver={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <CardMedia
          component="img"
          className="pixelated-image"
          src={getImageURL(image)}
          alt={`Thumbnail for room ${roomName}`}
        />
        {hover && (
          <ImageListItemBar
            title={roomName}
            subtitle={roomId}
            sx={{fontSize: 26}}
          />
        )}
      </CardActionArea>
    </Card>
  );
}

const ListChapterView: FC<ViewProps> = ({areaId, chapterId, sideId, side, showSubrooms}) => {
  return (
    <Fragment>
      {side.checkpoints.map((checkpoint, checkpointIndex) => (
        <Box key={checkpoint.name} sx={{display: "flex", flexDirection: "column", marginTop: 2, marginBottom: 2, padding: 0}}>
          <Typography component="div" variant="h5" color="text.secondary" marginTop={4} marginBottom={1}>
            {checkpointIndex + 1}. {checkpoint.name}
          </Typography>
          <List disablePadding>
            {checkpoint.roomOrder.map((roomId, roomIndex) => {
              const room: Room | undefined = side.rooms[roomId];
              if (room === undefined) {
                return undefined;
              }

              return (
                <Fragment key={roomId}>
                  {showSubrooms && room.subrooms ? room.subrooms.map((subroom, subroomIndex) => (
                    <ListChapterItem
                      key={subroomIndex}
                      roomId={roomId}
                      roomName={subroom.name}
                      roomNo={roomIndex + 1}
                      image={subroom.image}
                      href={`/${areaId}/${chapterId}/${sideId}/${roomId}/${subroomIndex + 1}`}
                    />
                  )) : (
                    <ListChapterItem
                      key={roomId}
                      roomId={roomId}
                      roomName={room.name}
                      roomNo={roomIndex + 1}
                      image={room.image}
                      href={`/${areaId}/${chapterId}/${sideId}/${roomId}`}
                    />
                  )}
                </Fragment>
              )
            })}
          </List>
          <Divider flexItem sx={{marginTop: 2, marginBottom: 1}} />
        </Box>
      ))}
    </Fragment>
  );
}

const ListChapterItem: FC<ViewItemProps & {roomNo: number}> = ({roomId, roomName, roomNo, href, image}) => {
  return (
    <ListItemButton
      disableGutters
      sx={{padding: 0, marginTop: 0.5, marginBottom: 0.5}}
      component="a"
      LinkComponent={Link}
      href={href}
    >
      <Image
        unoptimized
        src={getImageURL(image)}
        alt={`Image of room ${roomName}`}
        width={128}
        height={72}
      />
      <Typography component="div" variant="h6" marginLeft={2} color="text.secondary">{roomNo}.</Typography>
      <Typography component="div" variant="h6" marginLeft={2} flexGrow={1}>{roomName}</Typography>
      <Typography component="div" variant="h6" color="text.secondary" marginRight={0.5}>{roomId}</Typography>
    </ListItemButton>
  )
}

interface ChapterProps {
  areaId: string;
  area: Area;
  chapterId: string;
  chapter: Chapter;
}

interface ChapterParams extends ParsedUrlQuery {
  areaId: string;
  chapterId: string;
}

export const getStaticPaths: GetStaticPaths<ChapterParams> = async () => {
  const paths: {params: ChapterParams; locale?: string}[] = [];

  for (const [areaId, area] of Object.entries(DATA)) {
    for (const chapterId of Object.keys(area.chapters)) {
      paths.push({params: {areaId, chapterId}});
    }
  }

  return {
    paths,
    fallback: false,
  }
}


export const getStaticProps: GetStaticProps<ChapterProps, ChapterParams> = async ({params}) => {
  if (params === undefined) {
    throw Error("Params was not defined.")
  }

  const {areaId, chapterId} = params;
  const area: Area | undefined = DATA[areaId];
  if (area === undefined) {
    throw Error(`Area ${areaId} is not valid.`)
  }

  const chapter: Chapter | undefined = area.chapters[chapterId];
  if (chapter === undefined) {
    throw Error(`Chapter ${chapterId} is not valid`);
  }

  return {
    props: {
      areaId,
      area,
      chapterId,
      chapter,
    }
  }
}

export default ChapterPage;
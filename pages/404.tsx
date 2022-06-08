import { Box, Typography } from "@mui/material";
import { getCampImageUrl } from "logic/fetch/image";
import { CampHead } from "modules/head/CampHead";
import { NextPage } from "next";
import Image from "next/image";
import { Fragment } from "react";
import { GlobalCampProps } from "./_app";

const IMAGE = "farewell/1/1/2";

export const Custom404: NextPage<GlobalCampProps> = ({}) => {
  return (
    <Fragment>
      <CampHead
        description={"Page could not be found"}
        image={IMAGE}
      />
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" flex={1}>
        <Image
          unoptimized
          src={getCampImageUrl(IMAGE)}
          width={640}
          height={360}
          alt="Madeline standing in front of a grave"
          style={{
            imageRendering: "pixelated",
          }}
        />
        <Typography component="div" fontSize="large" marginTop={1}><strong>404</strong> - Page could not be found</Typography>
      </Box>
    </Fragment>
  );
}

export default Custom404;
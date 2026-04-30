import 'reflect-metadata';
import { Container } from 'inversify';
import { RestApplication } from './rest/rest.application.js';
import { Component } from './shared/types/component.enum.js';
import { createRestApplicationContainer } from './rest/rest.container.js';
import { createUserContainer } from './shared/modules/user/user.container.js';
import { createOfferContainer } from './shared/modules/offer/offer.container.js';
import { createCommentContainer } from './shared/modules/comment/comment.container.js';


async function bootstrap() {
  const mainContainer = new Container();

  createRestApplicationContainer(mainContainer);
  createUserContainer(mainContainer);
  createOfferContainer(mainContainer);
  createCommentContainer(mainContainer);

  const app = mainContainer.get<RestApplication>(Component.RestApplication);
  await app.init();
}

bootstrap();

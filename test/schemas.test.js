const {expect} = require('chai');
const {PLAYER_SCHEMA, PAGE_SCHEMA, PROTOCOL_SCHEMA, ID_SCHEMA, USERS_SCHEMA, USERS_PASSWORD_SCHEMA, IMAGE_FORMAT_SCHEMA} = require("../validation/validation-schemas");

describe("schemas", () => {
    describe("player", () => {
        describe("required fields", () => {
            it("should validate", () => {
                let validPlayer = {
                    username: "Bob",
                    password: "BobMotDePasse",
                    email: "bob@gmail.com"
                };
                expect(PLAYER_SCHEMA.validate(validPlayer).error).to.be.undefined;
            });
            describe("missing required fields", () => {
                it("should not validate due to missing field \"username\"", () => {
                    let invalidPlayer = {
                        password: "BobMotDePasse",
                        email: "bob@gmail.com"
                    };
                    expect(PLAYER_SCHEMA.validate(invalidPlayer).error).to.not.be.undefined;
                });
                it("should not validate due to missing field \"password\"", () => {
                    let invalidPlayer = {
                        username: "Bob",
                        email: "bob@gmail.com"
                    };
                    expect(PLAYER_SCHEMA.validate(invalidPlayer).error).to.not.be.undefined;
                });
                it("should not validate due to missing field \"email\"", () => {
                    let invalidPlayer = {
                        username: "Bob",
                        password: "BobMotDePasse"
                    };
                    expect(PLAYER_SCHEMA.validate(invalidPlayer).error).to.not.be.undefined;
                });
            });
            describe("invalid fields", () => {
                describe("username", () => {
                    it("should not validate due to username not being alphanumeric", () => {
                        let invalidPlayer = {
                            username: "Bôb",
                            password: "BobMotDePasse",
                            email: "bob@gmail.com"
                        };
                        expect(PLAYER_SCHEMA.validate(invalidPlayer).error).to.not.be.undefined;
                    });
                    it("should not validate due to username length being too short", () => {
                        let invalidPlayer = {
                            username: "Bo",
                            password: "BobMotDePasse",
                            email: "bob@gmail.com"
                        };
                        expect(PLAYER_SCHEMA.validate(invalidPlayer).error).to.not.be.undefined;
                    });
                    it("should not validate due to username length being too long", () => {
                        let invalidPlayer = {
                            username: "Booooooooooooooooooooooooooooooooooooooooooooooooob",
                            password: "BobMotDePasse",
                            email: "bob@gmail.com"
                        };
                        expect(PLAYER_SCHEMA.validate(invalidPlayer).error).to.not.be.undefined;
                    });
                });
                describe("password", () => {
                    it("should not validate due to password length being too short", () => {
                        let invalidPlayer = {
                            username: "Bob",
                            password: "Bo",
                            email: "bob@gmail.com"
                        };
                        expect(PLAYER_SCHEMA.validate(invalidPlayer).error).to.not.be.undefined;
                    });
                    it("should not validate due to username length being too long", () => {
                        let invalidPlayer = {
                            username: "Bob",
                            password: "BobMotDePasse".repeat(12),
                            email: "bob@gmail.com"
                        };
                        expect(PLAYER_SCHEMA.validate(invalidPlayer).error).to.not.be.undefined;
                    });
                });
                describe("email", () => {
                    it("should not validate as the email is not email-formatted", () => {
                        let invalidPlayer = {
                            username: "Bob",
                            password: "BobMotDePasse",
                            email: "bob@com"
                        };
                        expect(PLAYER_SCHEMA.validate(invalidPlayer).error).to.not.be.undefined;
                    });
                    it("should not validate as the email is not email-formatted", () => {
                        let invalidPlayer = {
                            username: "Bob",
                            password: "BobMotDePasse",
                            email: "bob@com.a"
                        };
                        expect(PLAYER_SCHEMA.validate(invalidPlayer).error).to.not.be.undefined;
                    });
                    it("should not validate as the email is not email-formatted", () => {
                        let invalidPlayer = {
                            username: "Bob",
                            password: "BobMotDePasse",
                            email: "@gmail.com"
                        };
                        expect(PLAYER_SCHEMA.validate(invalidPlayer).error).to.not.be.undefined;
                    });
                })
            });
        });
        describe("optionnal fields", () => {
            it("should validate", () => {
                let validPlayer = {
                    username: "Bob",
                    password: "BobMotDePasse",
                    email: "bob@gmail.com",
                    level: 12,
                    platform: "nodejs",
                    last_connection: new Date()
                };
                expect(PLAYER_SCHEMA.validate(validPlayer).error).to.be.undefined;
            });
            describe("invalid fields", () => {
                describe("level", () => {
                    it("should not validate as level is NaN", () => {
                        let invalidPlayer = {
                            username: "Bob",
                            password: "BobMotDePasse",
                            email: "bob@gmail.com",
                            level: Number.NaN
                        };
                        expect(PLAYER_SCHEMA.validate(invalidPlayer).error).to.not.be.undefined;
                    });
                    it("should not validate as level is a string", () => {
                        let invalidPlayer = {
                            username: "Bob",
                            password: "BobMotDePasse",
                            email: "bob@gmail.com",
                            level: "BobNiveau"
                        };
                        expect(PLAYER_SCHEMA.validate(invalidPlayer).error).to.not.be.undefined;
                    });
                    it("should not validate as level is not an integer", () => {
                        let invalidPlayer = {
                            username: "Bob",
                            password: "BobMotDePasse",
                            email: "bob@gmail.com",
                            level: 12.435
                        };
                        expect(PLAYER_SCHEMA.validate(invalidPlayer).error).to.not.be.undefined;
                    });
                    it("should not validate as level is too low", () => {
                        let invalidPlayer = {
                            username: "Bob",
                            password: "BobMotDePasse",
                            email: "bob@gmail.com",
                            level: 0
                        };
                        expect(PLAYER_SCHEMA.validate(invalidPlayer).error).to.not.be.undefined;
                    });
                    it("should not validate as level is too low", () => {
                        let invalidPlayer = {
                            username: "Bob",
                            password: "BobMotDePasse",
                            email: "bob@gmail.com",
                            level: -1
                        };
                        expect(PLAYER_SCHEMA.validate(invalidPlayer).error).to.not.be.undefined;
                    });
                    it("should not validate as level is too high", () => {
                        let invalidPlayer = {
                            username: "Bob",
                            password: "BobMotDePasse",
                            email: "bob@gmail.com",
                            level: 420283
                        };
                        expect(PLAYER_SCHEMA.validate(invalidPlayer).error).to.not.be.undefined;
                    });
                });
                describe("platform", () => {
                    it("should not validate due to platform not being alphanumeric", () => {
                        let invalidPlayer = {
                            username: "Bob",
                            password: "BobMotDePasse",
                            email: "bob@gmail.com",
                            platform: "Node.JS"
                        };
                        expect(PLAYER_SCHEMA.validate(invalidPlayer).error).to.not.be.undefined;
                    });
                });
                describe("last_connection", () => {
                    it("should not validate due to last_connection not being a non-date-formatted string", () => {
                        let invalidPlayer = {
                            username: "Bob",
                            password: "BobMotDePasse",
                            email: "bob@gmail.com",
                            last_connection: "BobDate"
                        }
                        expect(PLAYER_SCHEMA.validate(invalidPlayer).error).to.not.be.undefined;
                    });
                    it("should not validate due to last_connection being null", () => {
                        let invalidPlayer = {
                            username: "Bob",
                            password: "BobMotDePasse",
                            email: "bob@gmail.com",
                            last_connection: null
                        }
                        expect(PLAYER_SCHEMA.validate(invalidPlayer).error).to.not.be.undefined;
                    });
                });
            });
        });
    });
    describe("page", () => {
        it("should validate empty page and have default values", () => {
           let validPage = { };
           let validation = PAGE_SCHEMA.validate(validPage);
           expect(validation.error).to.be.undefined;
           expect(validation.value).to.not.be.undefined;
           expect(validation.value.per_page).to.eql(50);
           expect(validation.value.page).to.eql(1);
           expect(validation.value.order_by).to.eql(["id"]);
        });
        it("should validate valid page", () => {
            let validPage = {
                per_page: 25,
                page: 3,
                order_by: "id,email,level"
            };
            let validation = PAGE_SCHEMA.validate(validPage);
            expect(validation.error).to.be.undefined;
            expect(validation.value).to.not.be.undefined;
        });

        describe("per_page", () => {
            describe("valid", () => {
                it("should validate as per_page value is at minimum", () => {
                    let validPage = {
                        per_page: 10
                    };
                    let validation = PAGE_SCHEMA.validate(validPage);
                    expect(validation.error).to.be.undefined;
                    expect(validation.value).to.not.be.undefined;
                });
                it("should validate as per_page value is at maximum", () => {
                    let validPage = {
                        per_page: 100
                    };
                    let validation = PAGE_SCHEMA.validate(validPage);
                    expect(validation.error).to.be.undefined;
                    expect(validation.value).to.not.be.undefined;
                });
            });
            describe("invalid", () => {
                it("should not validate as per_page value is smaller than minimum", () => {
                    let invalidPage = {
                        per_page: 9
                    };
                    expect(PAGE_SCHEMA.validate(invalidPage).error).to.not.be.undefined;
                });
                it("should not validate as per_page value is greater than maximum", () => {
                    let invalidPage = {
                        per_page: 101
                    };
                    expect(PAGE_SCHEMA.validate(invalidPage).error).to.not.be.undefined;
                });
                it("should not validate as per_page is a string", () => {
                    let invalidPage = {
                        per_page: "per_page"
                    };
                    expect(PAGE_SCHEMA.validate(invalidPage).error).to.not.be.undefined;
                });
                it("should not validate as per_page is not an integer", () => {
                    let invalidPage = {
                        per_page: "per_page"
                    };
                    expect(PAGE_SCHEMA.validate(invalidPage).error).to.not.be.undefined;
                });
            });
        });

        describe("page", () => {
            describe("valid", () => {
                it("should validate as page value is at minimum", () => {
                    let validPage = {
                        page: 1
                    };
                    let validation = PAGE_SCHEMA.validate(validPage);
                    expect(validation.error).to.be.undefined;
                    expect(validation.value).to.not.be.undefined;
                });
            });
            describe("invalid", () => {
                it("should not validate as page value is smaller than minimum", () => {
                    let invalidPage = {
                        per_page: 0
                    };
                    expect(PAGE_SCHEMA.validate(invalidPage).error).to.not.be.undefined;
                });
                it("should not validate as page is a string", () => {
                    let invalidPage = {
                        page: "page"
                    };
                    expect(PAGE_SCHEMA.validate(invalidPage).error).to.not.be.undefined;
                });
                it("should not validate as page is not an integer", () => {
                    let invalidPage = {
                        per_page: 1.9
                    };
                    expect(PAGE_SCHEMA.validate(invalidPage).error).to.not.be.undefined;
                });
            });
        });

        describe("order_by", () => {
            describe("valid", () => {
                it("should validate as order_by is equal a single valid value", () => {
                    let validPage = {
                        order_by: "username"
                    }
                    let validation = PAGE_SCHEMA.validate(validPage);
                    expect(validation.error).to.be.undefined;
                    expect(validation.value).to.not.be.undefined;
                });
                it("should validate as order_by is equal to multiple valid values", () => {
                    let validPage = {
                        order_by: "id,level,username"
                    }
                    let validation = PAGE_SCHEMA.validate(validPage);
                    expect(validation.error).to.be.undefined;
                    expect(validation.value).to.not.be.undefined;
                });
            });
            describe("invalid", () => {
                it("should not validate as the only specified value in order_by is not a valid field", () => {
                    let invalidPage = {
                        order_by: "bob"
                    };
                    expect(PAGE_SCHEMA.validate(invalidPage).error).to.not.be.undefined;
                });
                it("should not validate as one of the specified values in order_by is not a valid field", () => {
                    let invalidPage = {
                        order_by: "id,bob,username"
                    };
                    expect(PAGE_SCHEMA.validate(invalidPage).error).to.not.be.undefined;
                });
                it("should not validate as an empty string is not a valid order_by field", () => {
                    let invalidPage = {
                        order_by: ""
                    };
                    expect(PAGE_SCHEMA.validate(invalidPage).error).to.not.be.undefined;
                });
                it("should not validate as a coma is not a valid order_by field", () => {
                    let invalidPage = {
                        order_by: ",,,"
                    };
                    expect(PAGE_SCHEMA.validate(invalidPage).error).to.not.be.undefined;
                });
            });
        });
    });
    describe("protocol", () => {
        describe("valid", () => {
            it("should validate as \"http\" is a valid protocol", () => {
                let validProtocol = {
                    protocol:"http"
                }
                expect(PROTOCOL_SCHEMA.validate(validProtocol).error).to.be.undefined;
                expect(PROTOCOL_SCHEMA.validate(validProtocol).value).to.not.be.undefined;
            });
            it("should validate as \"https\" is a valid protocol", () => {
                let validProtocol = {
                    protocol:"https"
                }
                expect(PROTOCOL_SCHEMA.validate(validProtocol).error).to.be.undefined;
                expect(PROTOCOL_SCHEMA.validate(validProtocol).value).to.not.be.undefined;
            });
        });
        describe("invalid", () => {
            it("should not validate as protocol is required", () => {
                let invalidProtocol = {};
                expect(PROTOCOL_SCHEMA.validate(invalidProtocol).error).to.not.be.undefined;
            });
            it("should not validate as \"https://google.ca#\" is not a valid protocol", () => {
                let invalidProtocol = {
                    protocol: "https://google.ca#"
                };
                expect(PROTOCOL_SCHEMA.validate(invalidProtocol).error).to.not.be.undefined;
            });
        });
    });
    describe("id", () => {
        describe('valid', () => {
            it("should validate as id is an integer that is greater than 0", () => {
                let validId = {
                    id: 1
                };

                expect(ID_SCHEMA.validate(validId).error).to.be.undefined;
                expect(ID_SCHEMA.validate(validId).value).to.not.be.undefined;
            })
        });
        describe("invalid", () => {
            it("should not validate as id is a string", () => {
                let invalidId = {
                    id: "id"
                };

                expect(ID_SCHEMA.validate(invalidId).error).to.not.be.undefined;
            });
            it("should not validate as id is not an integer", () => {
                let invalidId= {
                    id: 1.2
                };

                expect(ID_SCHEMA.validate(invalidId).error).to.not.be.undefined;
            });
            it("should not validate as id is not greater than 0", () => {
                let invalidId= {
                    id: 1.2
                };

                expect(ID_SCHEMA.validate(invalidId).error).to.not.be.undefined;
            });
            it("should not validate as id is required", () => {
                let invalidId= { };

                expect(ID_SCHEMA.validate(invalidId).error).to.not.be.undefined;
            });
        })
    });
    describe("file format", () => {
        describe("valid", () => {
            it("should validate as 'png' is a valid file format'", () => {
                let validFormat = {
                    format: "png"
                }
                expect(IMAGE_FORMAT_SCHEMA.validate(validFormat).error).to.be.undefined;
                expect(IMAGE_FORMAT_SCHEMA.validate(validFormat).value).to.not.be.undefined;
            });
            it("should validate as 'jpg' is a valid file format'", () => {
                let validFormat = {
                    format: "jpg"
                }
                expect(IMAGE_FORMAT_SCHEMA.validate(validFormat).error).to.be.undefined;
                expect(IMAGE_FORMAT_SCHEMA.validate(validFormat).value).to.not.be.undefined;
            });
            it("should validate as 'jpeg' is a valid file format'", () => {
                let validFormat = {
                    format: "jpeg"
                }
                expect(IMAGE_FORMAT_SCHEMA.validate(validFormat).error).to.be.undefined;
                expect(IMAGE_FORMAT_SCHEMA.validate(validFormat).value).to.not.be.undefined;
            });
        });
        describe("invalid", () => {
            it("should not validate as 'pneg' is not a valid format", () => {
                let invalidFormat = {
                    format: "pneg"
                }

                expect(IMAGE_FORMAT_SCHEMA.validate(invalidFormat).error).to.not.be.undefined;
            });
            it("should not validate as 1 is not a string", () => {
                let invalidFormat = {
                    format: 1
                }

                expect(IMAGE_FORMAT_SCHEMA.validate(invalidFormat).error).to.not.be.undefined;
            });
        })
    });
    describe("user", () => {
        it("should validate as all required fields are present and valid", () => {
            let validUser = {
                username: "BobNom",
                password: "BobMotDePasse"
            }

            expect(USERS_SCHEMA.validate(validUser).error).to.be.undefined;
            expect(USERS_SCHEMA.validate(validUser).value).to.not.be.undefined;
        });

        describe("username", () => {
            describe("valid", () => {
                it("should validate as name length is at minimum length", () => {
                    let validUser = {
                        username: "Bob",
                        password: "BobMotDePasse"
                    }

                    expect(USERS_SCHEMA.validate(validUser).error).to.be.undefined;
                    expect(USERS_SCHEMA.validate(validUser).value).to.not.be.undefined;
                });
                it("should validate as name length is at maximum length", () => {
                    let validUser = {
                        username: "BobNo".repeat(10),
                        password: "BobMotDePasse"
                    }

                    expect(USERS_SCHEMA.validate(validUser).error).to.be.undefined;
                    expect(USERS_SCHEMA.validate(validUser).value).to.not.be.undefined;
                });
            });
            describe("invalid", () => {
                it("should not validate as username length is smaller than the minimum length", () => {
                    let invalidUser = {
                        username: "Bo",
                        password: "BobMotDePasse"
                    }

                    expect(USERS_SCHEMA.validate(invalidUser).error).to.not.be.undefined;
                });
                it("should not validate as username length is greater than the minimum length", () => {
                    let invalidUser = {
                        username: "BobNom".repeat(10),
                        password: "BobMotDePasse"
                    }

                    expect(USERS_SCHEMA.validate(invalidUser).error).to.not.be.undefined;
                });
                it("should not validate as username is not alphanumeric", () => {
                    let invalidUser = {
                        username: "BobNôm",
                        password: "BobMotDePasse"
                    }

                    expect(USERS_SCHEMA.validate(invalidUser).error).to.not.be.undefined;
                });
                it("should not validate as username is required", () => {
                    let invalidUser = {
                        password: "BobMotDePasse"
                    }

                    expect(USERS_SCHEMA.validate(invalidUser).error).to.not.be.undefined;
                })
            });
        });

        describe("password", () => {
            describe("valid", () => {
                it("should validate as password length is at minimum length", () => {
                    let validUser = {
                        username: "BobNom",
                        password: "Bob"
                    }

                    expect(USERS_SCHEMA.validate(validUser).error).to.be.undefined;
                    expect(USERS_SCHEMA.validate(validUser).value).to.not.be.undefined;
                });
                it("should validate as password length is at maximum length", () => {
                    let validUser = {username: "BobNom",
                        password: "BobMo".repeat(10)
                    }

                    expect(USERS_SCHEMA.validate(validUser).error).to.be.undefined;
                    expect(USERS_SCHEMA.validate(validUser).value).to.not.be.undefined;
                });

            });
            describe("invalid", () => {
                it("should not validate as password length is smaller than the minimum length", () => {
                    let invalidUser = {
                        username: "BobNom",
                        password: "Bo"
                    }

                    expect(USERS_SCHEMA.validate(invalidUser).error).to.not.be.undefined;
                });
                it("should not validate as password length is greater than the minimum length", () => {
                    let invalidUser = {
                        username: "BobNom",
                        password: "BobMotDePasse".repeat(10)
                    }

                    expect(USERS_SCHEMA.validate(invalidUser).error).to.not.be.undefined;
                });
                it("should not validate as password is required", () => {
                    let invalidUser = {
                        username: "BobNom"
                    }

                    expect(USERS_SCHEMA.validate(invalidUser).error).to.not.be.undefined;
                });
            });
        });
    });
    describe("user password", () => {
        describe("valid", () => {
            it("should validate as password length is at minimum length", () => {
                let validUser = {
                    password: "Bob"
                }

                expect(USERS_PASSWORD_SCHEMA.validate(validUser).error).to.be.undefined;
                expect(USERS_PASSWORD_SCHEMA.validate(validUser).value).to.not.be.undefined;
            });
            it("should validate as password length is at maximum length", () => {
                let validUser = {
                    password: "BobMo".repeat(10)
                }

                expect(USERS_PASSWORD_SCHEMA.validate(validUser).error).to.be.undefined;
                expect(USERS_PASSWORD_SCHEMA.validate(validUser).value).to.not.be.undefined;
            });

        });
        describe("invalid", () => {
            it("should not validate as password length is smaller than the minimum length", () => {
                let invalidUser = {
                    password: "Bo"
                }

                expect(USERS_PASSWORD_SCHEMA.validate(invalidUser).error).to.not.be.undefined;
            });
            it("should not validate as password length is greater than the minimum length", () => {
                let invalidUser = {
                    password: "BobMotDePasse".repeat(10)
                }

                expect(USERS_PASSWORD_SCHEMA.validate(invalidUser).error).to.not.be.undefined;
            });
            it("should not validate as password is required", () => {
                let invalidUser = { };

                expect(USERS_PASSWORD_SCHEMA.validate(invalidUser).error).to.not.be.undefined;
            });
        });
    });
});